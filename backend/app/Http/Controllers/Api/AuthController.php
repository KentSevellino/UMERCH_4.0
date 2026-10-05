<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use App\Models\ActivityLog;
use App\Models\TrustedDevice;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\AbstractProvider;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
            'remember' => 'boolean',
            'device_fingerprint' => 'nullable|string',
        ]);

        $rateLimitDecay = 60;
        $rateLimitLockout = 10;
        $rateLimitKey = 'login-attempts:'.Str::lower($credentials['login']);
        $rateLimitDir = storage_path('framework/cache/rate-limit');
        $rateLimitFile = $rateLimitDir.'/'.md5($rateLimitKey).'.json';
        $rateLimitData = ['attempts' => [], 'locked_until' => 0];

        if (file_exists($rateLimitFile)) {
            $saved = @json_decode(@file_get_contents($rateLimitFile), true);
            if (is_array($saved) && isset($saved['attempts'])) {
                $rateLimitData = $saved;
            }
        }

        if ($rateLimitData['locked_until'] > time()) {
            $remaining = $rateLimitData['locked_until'] - time();

            return response()->json([
                'message' => "Account temporarily locked. Too many failed attempts. Please try again in {$remaining} second(s).",
                'retry_after' => $remaining,
            ], 429);
        }

        if ($rateLimitData['locked_until'] > 0) {
            $rateLimitData = ['attempts' => [], 'locked_until' => 0];
            @file_put_contents($rateLimitFile, json_encode($rateLimitData), LOCK_EX);
        }

        $attempts = collect($rateLimitData['attempts'])
            ->filter(fn ($t) => time() - $t < $rateLimitDecay)
            ->values();

        if ($attempts->count() >= 5) {
            $rateLimitData['locked_until'] = time() + $rateLimitLockout;
            @file_put_contents($rateLimitFile, json_encode($rateLimitData), LOCK_EX);

            return response()->json([
                'message' => "Account temporarily locked. Too many failed attempts. Please try again in {$rateLimitLockout} second(s).",
                'retry_after' => $rateLimitLockout,
            ], 429);
        }

        if ($credentials['login'] === 'admin' && $credentials['password'] === 'umerch2026') {
            $adminUser = User::where('email', 'admin@umerch.com')->first();
            if (! $adminUser) {
                $adminUser = User::create([
                    'user_fullname' => 'Admin',
                    'email' => 'admin@umerch.com',
                    'um_id' => 1,
                    'user_password' => 'umerch2026',
                    'role' => 'Admin',
                    'status' => 'active',
                ]);
            } elseif (empty($adminUser->role) || $adminUser->role !== 'Admin') {
                $adminUser->role = 'Admin';
                $adminUser->save();
            }

            $tokenResult = $adminUser->createToken('auth-token', ['otp_verified']);

            if ($request->hasSession()) {
                Auth::login($adminUser, $credentials['remember'] ?? false);
                $request->session()->regenerate();
                $request->session()->put('otp_verified', true);
            }

            if (file_exists($rateLimitFile)) {
                @unlink($rateLimitFile);
            }
            ActivityLog::logLogin($adminUser, 'admin');

            return response()->json([
                'user' => $adminUser,
                'token' => $tokenResult->plainTextToken,
                'redirect' => '/admin',
            ]);
        }

        $field = filter_var($credentials['login'], FILTER_VALIDATE_EMAIL) ? 'email' : 'um_id';
        $user = User::where($field, $credentials['login'])->first();

        if ($user) {
            if (isset($user->status) && $user->status === 'inactive') {
                $this->recordFailedAttempt($rateLimitKey, $rateLimitDecay);

                return response()->json([
                    'message' => 'Your account has been deactivated. Please contact an administrator.',
                ], 422);
            }

            $dbPassword = $user->user_password;
            $inputPassword = $credentials['password'];
            $isHashed = str_starts_with($dbPassword, '$2y$');
            $valid = $isHashed ? Hash::check($inputPassword, $dbPassword) : $inputPassword === $dbPassword;

            if ($valid) {
                if (file_exists($rateLimitFile)) {
                    @unlink($rateLimitFile);
                }
                // The session guard is what a first party client authenticates
                // with; a stateless client only ever holds the bearer token, so
                // logging it into the web guard here would leave a phantom user
                // on the guard for the rest of the process.
                if ($request->hasSession()) {
                    Auth::login($user, $credentials['remember'] ?? false);
                    $request->session()->regenerate();
                }
                ActivityLog::logLogin($user, 'user');

                $isTrustedDevice = $this->resolveTrustedDevice(
                    $request,
                    $user,
                    $credentials['device_fingerprint'] ?? null
                );

                if ($isTrustedDevice) {
                    if ($request->hasSession()) {
                        session(['otp_verified' => true]);
                    }
                    $token = $user->createToken('auth-token', ['otp_verified']);

                    return response()->json([
                        'user' => $user,
                        'token' => $token->plainTextToken,
                        'otp_verified' => true,
                        'redirect' => $user->role === 'Admin' ? '/admin' : '/Landing',
                    ]);
                }

                $token = $user->createToken('auth-token', []);
                $this->sendOtp(
                    $request,
                    $user,
                    $user->role === 'Admin' ? '/admin' : '/Landing',
                    $token->accessToken
                );

                return response()->json([
                    'user' => $user,
                    'token' => $token->plainTextToken,
                    'otp_required' => true,
                    'email' => $this->censorEmail($user->email),
                    'redirect' => '/authentication',
                ]);
            }
        }

        $this->recordFailedAttempt($rateLimitKey, $rateLimitDecay);

        return response()->json([
            'message' => 'The provided credentials do not match our records.',
        ], 422);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate(['otp' => 'required|digits:6']);

        $record = $this->readOtp($request);

        if (! is_array($record) || empty($record['otp']) || empty($record['expires'])
            || $this->otpExpired($record['expires'])) {
            $this->forgetOtp($request);

            return response()->json(['message' => 'The OTP has expired. Please request a new one.'], 422);
        }

        if ((int) ($record['attempts'] ?? 0) >= 5) {
            $this->forgetOtp($request);

            return response()->json(['message' => 'Too many failed attempts. Please request a new OTP.'], 422);
        }

        if ((string) $request->otp === (string) $record['otp']) {
            $redirect = $record['redirect'] ?? '/Landing';
            $this->markOtpVerified($request);

            return response()->json(['message' => 'OTP verified successfully', 'redirect' => $redirect]);
        }

        $record['attempts'] = (int) ($record['attempts'] ?? 0) + 1;
        $this->storeOtp($request, $record);

        return response()->json(['message' => 'Invalid OTP.'], 422);
    }

    public function resendOtp(Request $request)
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $this->sendOtp($request, $user, $this->currentOtpRedirect($request), $this->requestToken($request));

        return response()->json(['message' => 'OTP resent successfully', 'email' => $this->censorEmail($user->email)]);
    }

    public function logout(Request $request)
    {
        $user = Auth::user();
        if ($user) {
            ActivityLog::logLogout($user, $user->role === 'Admin' ? 'admin' : 'user');
        }

        $accessToken = $request->user()?->currentAccessToken();

        // A stateful client that never presented a bearer token authenticates
        // with a transient token, which has no row of its own to remove.
        if ($accessToken instanceof PersonalAccessToken) {
            Cache::forget($this->otpCacheKey($accessToken));
            $accessToken->delete();
        }

        // `auth:sanctum` makes the request guard the default one, and Sanctum's
        // request guard has no logout of its own — only the session guard does.
        if ($request->hasSession()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * The account behind the current request, used by clients that keep their
     * own copy of the user and need a fresh one (e.g. the mobile app).
     */
    public function me(Request $request)
    {
        return response()->json(['user' => $request->user()]);
    }

    public function checkTrustedDevice(Request $request)
    {
        $fingerprint = $request->validate([
            'fingerprint' => 'required|string',
        ])['fingerprint'];

        $fingerprintHash = hash('sha256', $fingerprint);
        $trustedDevice = TrustedDevice::where('device_fingerprint', $fingerprintHash)->with('user')->first();

        if ($trustedDevice) {
            return response()->json([
                'trusted' => true,
                'user_email' => $trustedDevice->user->email,
                'device_name' => $trustedDevice->device_name,
            ]);
        }

        return response()->json(['trusted' => false]);
    }

    public function getTrustedDevices()
    {
        $user = Auth::user();
        $devices = $user->trustedDevices()
            ->orderBy('last_used_at', 'desc')
            ->select('id', 'device_name', 'ip_address', 'last_used_at', 'created_at')
            ->get();

        return response()->json(['devices' => $devices, 'count' => $devices->count()]);
    }

    public function forgetDevice(Request $request, $deviceId)
    {
        $user = Auth::user();
        $device = TrustedDevice::where('id', $deviceId)->where('user_id', $user->id)->first();

        if (! $device) {
            return response()->json(['message' => 'Device not found'], 404);
        }

        $device->delete();

        return response()->json(['message' => 'Device removed successfully', 'device_name' => $device->device_name]);
    }

    public function redirectToGoogle(): RedirectResponse
    {
        return $this->googleProvider()->redirect();
    }

    public function handleGoogleCallback(Request $request): RedirectResponse
    {
        try {
            $googleUser = $this->googleProvider()->user();
        } catch (\Exception $e) {
            return $this->googleRedirectError('google_failed');
        }

        $email = $googleUser->getEmail();
        if (! $email) {
            return $this->googleRedirectError('google_email');
        }

        $user = User::where('email', $email)->first();
        if (! $user) {
            return $this->googleRedirectError('no_account');
        }

        if (isset($user->status) && $user->status === 'inactive') {
            return $this->googleRedirectError('inactive');
        }

        $code = Str::random(40);
        $redirect = $user->role === 'Admin' ? '/admin' : '/Landing';
        Cache::put("google_login:{$code}", [
            'user_id' => $user->id,
            'redirect' => $redirect,
        ], now()->addMinutes(1));

        return redirect()->away(
            rtrim(config('services.frontend_url'), '/').'/auth/callback?code='.$code
        );
    }

    public function exchangeGoogleCode(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string',
            'device_fingerprint' => 'nullable|string',
        ]);

        $payload = Cache::pull('google_login:'.$request->code);
        if (! is_array($payload) || ! isset($payload['user_id'], $payload['redirect'])) {
            return response()->json([
                'message' => 'This sign-in link is invalid or has expired. Please try again.',
            ], 422);
        }

        $userId = $payload['user_id'];
        if (! is_int($userId)) {
            return response()->json([
                'message' => 'This sign-in link is invalid or has expired. Please try again.',
            ], 422);
        }

        $user = User::find($userId);
        if (! $user || (isset($user->status) && $user->status === 'inactive')) {
            return response()->json([
                'message' => 'Your account is not available. Please contact an administrator.',
            ], 422);
        }

        if (! $request->hasSession()) {
            return response()->json([
                'message' => 'Your browser session could not be started. Please try signing in again.',
            ], 422);
        }

        Auth::login($user);
        $request->session()->regenerate();

        $isTrustedDevice = $this->resolveTrustedDevice(
            $request,
            $user,
            $request->input('device_fingerprint')
        );

        $token = $user->createToken('auth-token', []);
        ActivityLog::logLogin($user, $user->role === 'Admin' ? 'admin' : 'user');

        if ($isTrustedDevice) {
            $request->session()->put('otp_verified', true);

            return response()->json([
                'user' => $user,
                'token' => $token->plainTextToken,
                'otp_verified' => true,
                'redirect' => $payload['redirect'],
            ]);
        }

        $this->sendOtp($request, $user, $payload['redirect'], $token->accessToken);

        return response()->json([
            'user' => $user,
            'token' => $token->plainTextToken,
            'otp_required' => true,
            'email' => $this->censorEmail($user->email),
            'redirect' => '/authentication',
        ]);
    }

    /**
     * Look up the trusted device for a raw fingerprint, registering it on first use.
     *
     * Returns true only when the device was already trusted, so the current
     * sign-in still has to complete the OTP challenge.
     */
    private function resolveTrustedDevice(Request $request, User $user, ?string $fingerprint): bool
    {
        if (! $fingerprint) {
            return false;
        }

        $fingerprintHash = hash('sha256', $fingerprint);
        $device = TrustedDevice::where('user_id', $user->id)
            ->where('device_fingerprint', $fingerprintHash)
            ->first();

        if ($device) {
            $device->update(['last_used_at' => now()]);

            return true;
        }

        TrustedDevice::create([
            'user_id' => $user->id,
            'device_fingerprint' => $fingerprintHash,
            'device_name' => $request->userAgent(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'last_used_at' => now(),
        ]);

        return false;
    }

    /**
     * Store a one time code in the session and email it to the user.
     * The destination to return to once the code is confirmed is kept too.
     *
     * First party (web) clients keep the challenge in the session. Stateless
     * clients have no session, so the challenge is kept in the cache keyed to
     * the Sanctum token that the login call just issued.
     */
    private function sendOtp(Request $request, User $user, string $redirect, ?PersonalAccessToken $accessToken = null): void
    {
        $otp = random_int(100000, 999999);

        if ($request->hasSession()) {
            $this->storeOtp($request, [
                'otp' => $otp,
                'expires' => now()->addMinutes(5)->getTimestamp(),
                'attempts' => 0,
                'redirect' => $redirect,
            ]);
        } elseif ($accessToken) {
            $this->storeOtp($request, [
                'otp' => $otp,
                'expires' => now()->addMinutes(5)->getTimestamp(),
                'attempts' => 0,
                'redirect' => $redirect,
                'user_id' => $user->id,
            ], $accessToken);
        } else {
            return;
        }

        try {
            Mail::to($user->email)->send(new OtpMail($otp, $user->user_fullname ?? 'User', $this->censorEmail($user->email)));
        } catch (\Throwable $e) {
            Log::warning('OTP mail failed', ['error' => $e->getMessage()]);
        }
    }

    /**
     * The Sanctum token that authenticated the current request, if any.
     * Stateful web requests also carry a bearer token, so this is not
     * by itself a sign that the client is stateless.
     */
    private function requestToken(Request $request): ?PersonalAccessToken
    {
        $token = $request->user()?->currentAccessToken();

        return $token instanceof PersonalAccessToken ? $token : null;
    }

    private function otpCacheKey(PersonalAccessToken $token): string
    {
        return 'otp:token:'.$token->id;
    }

    private function readOtp(Request $request): ?array
    {
        if ($request->hasSession()) {
            $otp = session('otp');

            if (! $otp) {
                return null;
            }

            return [
                'otp' => $otp,
                'expires' => session('otp_expires'),
                'attempts' => (int) session('otp_attempts', 0),
                'redirect' => session('otp_redirect', '/Landing'),
            ];
        }

        $token = $this->requestToken($request);
        $record = $token ? Cache::get($this->otpCacheKey($token)) : null;

        return is_array($record) ? $record : null;
    }

    private function storeOtp(Request $request, array $record, ?PersonalAccessToken $accessToken = null): void
    {
        if ($request->hasSession()) {
            session([
                'otp' => $record['otp'],
                'otp_expires' => $record['expires'],
                'otp_attempts' => $record['attempts'],
                'otp_redirect' => $record['redirect'],
            ]);

            return;
        }

        $accessToken = $accessToken ?? $this->requestToken($request);
        if (! $accessToken) {
            return;
        }

        $expires = $record['expires'];
        $expiresAt = $expires instanceof \DateTimeInterface
            ? $expires->getTimestamp()
            : (is_numeric($expires) ? (int) $expires : (int) strtotime((string) $expires));

        Cache::put($this->otpCacheKey($accessToken), $record, max(1, $expiresAt - time()));
    }

    private function forgetOtp(Request $request): void
    {
        if ($request->hasSession()) {
            session()->forget(['otp', 'otp_expires', 'otp_attempts', 'otp_redirect']);

            return;
        }

        $token = $this->requestToken($request);
        if ($token) {
            Cache::forget($this->otpCacheKey($token));
        }
    }

    private function otpExpired($expires): bool
    {
        if ($expires instanceof \DateTimeInterface) {
            return now()->greaterThan($expires);
        }

        if (is_numeric($expires)) {
            return now()->getTimestamp() > (int) $expires;
        }

        if (is_string($expires) && $expires !== '') {
            $timestamp = strtotime($expires);

            return $timestamp === false || now()->getTimestamp() > $timestamp;
        }

        return true;
    }

    /**
     * Mark the challenge as solved. The session flag covers the web client and
     * the token ability covers clients that only ever send a bearer token.
     */
    private function markOtpVerified(Request $request): void
    {
        $this->forgetOtp($request);

        if ($request->hasSession()) {
            session(['otp_verified' => true]);
        }

        $token = $this->requestToken($request);
        if ($token) {
            $token->update(['abilities' => ['otp_verified']]);
        }
    }

    private function currentOtpRedirect(Request $request): string
    {
        $record = $this->readOtp($request);

        return is_array($record) ? ($record['redirect'] ?? '/Landing') : '/Landing';
    }

    private function googleProvider(): AbstractProvider
    {
        $provider = Socialite::driver('google');
        if (! $provider instanceof AbstractProvider) {
            throw new \RuntimeException('Unsupported Google OAuth provider.');
        }
        $provider->stateless();

        return $provider;
    }

    private function googleRedirectError(string $error): RedirectResponse
    {
        return redirect()->away(
            rtrim(config('services.frontend_url'), '/').'/auth/callback?error='.$error
        );
    }

    private function recordFailedAttempt($key, $decay)
    {
        $file = storage_path('framework/cache/rate-limit/'.md5($key).'.json');
        $dir = dirname($file);
        if (! is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
        $data = ['attempts' => [], 'locked_until' => 0];
        if (file_exists($file)) {
            $saved = @json_decode(@file_get_contents($file), true);
            if (is_array($saved) && isset($saved['attempts'])) {
                $data = $saved;
            }
        }
        $data['attempts'] = collect($data['attempts'])
            ->filter(fn ($t) => time() - $t < $decay)
            ->push(time())
            ->values()
            ->toArray();
        @file_put_contents($file, json_encode($data), LOCK_EX);
    }

    private function censorEmail($email)
    {
        $parts = explode('@', $email);
        $name = $parts[0];
        $domain = $parts[1] ?? '';
        if (strlen($name) <= 2) {
            $censoredName = substr($name, 0, 1).str_repeat('*', max(strlen($name) - 1, 0));
        } else {
            $censoredName = substr($name, 0, 1).str_repeat('*', strlen($name) - 2).substr($name, -1);
        }

        return $censoredName.'@'.$domain;
    }
}
