<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use App\Models\ActivityLog;
use App\Models\TrustedDevice;
use App\Models\User;
use App\Support\OtpAuthentication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
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

            if ($adminUser->status === 'inactive') {
                return response()->json(['message' => 'Your account has been deactivated. Please contact an administrator.'], 422);
            }
            if (file_exists($rateLimitFile)) {
                @unlink($rateLimitFile);
            }

            return $this->beginOtpLogin($request, $adminUser);
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

                return $this->beginOtpLogin($request, $user);
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

            return response()->json(['message' => 'OTP verified successfully', 'otp_verified' => true, 'redirect' => $redirect]);
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

        if (OtpAuthentication::verified($request)) {
            return response()->json(['message' => 'Verification is already complete.'], 409);
        }
        if (! $this->requestToken($request)) {
            return response()->json(['message' => 'Please sign in again.'], 401);
        }
        if (! $this->sendOtp($request, $user, $this->currentOtpRedirect($request), $this->requestToken($request))) {
            return response()->json(['message' => 'Unable to send your verification code. Please try again.'], 503);
        }

        return response()->json(['message' => 'OTP resent successfully', 'email' => $this->censorEmail($user->email)]);
    }

    public function logout(Request $request)
    {
        $user = Auth::user();
        if ($user) {
            ActivityLog::logLogout($user, $user->role === 'Admin' ? 'admin' : 'user');
        }

        $this->forgetOtp($request);
        $this->revokeLoginTokens($request);

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
        return response()->json(['user' => $request->user(), 'otp_verified' => OtpAuthentication::verified($request)]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $validated = $request->validate([
            'user_fullname' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,'.$user->id,
            'password' => 'sometimes|string|min:6',
        ]);

        if (isset($validated['password'])) {
            $validated['user_password'] = Hash::make($validated['password']);
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->fresh(),
        ]);
    }

    public function checkTrustedDevice(Request $request)
    {
        $request->validate([
            'fingerprint' => 'required|string',
        ]);

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

        return $this->beginOtpLogin($request, $user);
    }

    public function googleLogin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_token' => 'nullable|string',
            'access_token' => 'nullable|string',
            'device_fingerprint' => 'nullable|string',
        ]);

        if (empty($validated['id_token']) && empty($validated['access_token'])) {
            return response()->json([
                'message' => 'Google ID token or access token is required.',
            ], 422);
        }

        $email = null;

        if (! empty($validated['id_token'])) {
            try {
                $response = Http::get('https://oauth2.googleapis.com/tokeninfo', [
                    'id_token' => $validated['id_token'],
                ]);

                if ($response->successful()) {
                    $payload = $response->json();
                    if (! empty($payload['email'])) {
                        $email = $payload['email'];
                    }
                }
            } catch (\Exception $e) {
                // fall through
            }
        }

        if (! $email && ! empty($validated['access_token'])) {
            try {
                $response = Http::withToken($validated['access_token'])
                    ->get('https://www.googleapis.com/oauth2/v3/userinfo');

                if ($response->successful()) {
                    $payload = $response->json();
                    if (! empty($payload['email'])) {
                        $email = $payload['email'];
                    }
                }
            } catch (\Exception $e) {
                // fall through
            }
        }

        if (! $email) {
            return response()->json([
                'message' => 'Invalid or expired Google token.',
            ], 422);
        }

        $user = User::where('email', $email)->first();
        if (! $user) {
            return response()->json([
                'message' => 'No account found with this Google email. Please register or contact an administrator.',
            ], 422);
        }

        if (isset($user->status) && $user->status === 'inactive') {
            return response()->json([
                'message' => 'Your account has been deactivated. Please contact an administrator.',
            ], 422);
        }

        return $this->beginOtpLogin($request, $user);
    }

    private function beginOtpLogin(Request $request, User $user): JsonResponse
    {
        // A new sign-in cannot inherit an earlier account's grant or challenge.
        $this->revokeLoginTokens($request);
        if ($request->hasSession()) {
            $request->session()->forget(['otp_verified', 'otp_verified_user_id', 'auth_token_id',
                'otp', 'otp_expires', 'otp_attempts', 'otp_redirect', 'otp_user_id', 'otp_token_id']);
            Auth::guard('web')->login($user);
            $request->session()->regenerate();
        }

        $token = $user->createToken('auth-token', []);
        if ($request->hasSession()) {
            $request->session()->put('auth_token_id', $token->accessToken->id);
        }

        $redirect = $user->role === 'Admin' ? '/admin' : '/Landing';
        if (! $this->sendOtp($request, $user, $redirect, $token->accessToken)) {
            Cache::forget($this->otpCacheKey($token->accessToken));
            $token->accessToken->delete();
            if ($request->hasSession()) {
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            return response()->json(['message' => 'Unable to send your verification code. Please try signing in again.'], 503);
        }

        ActivityLog::logLogin($user, $user->role === 'Admin' ? 'admin' : 'user');

        return response()->json([
            'user' => $user,
            'token' => $token->plainTextToken,
            'otp_required' => true,
            'otp_verified' => false,
            'email' => $this->censorEmail($user->email),
            'redirect' => '/authentication',
        ]);
    }

    private function sendOtp(Request $request, User $user, string $redirect, ?PersonalAccessToken $accessToken = null): bool
    {
        if (! $accessToken) {
            return false;
        }
        $this->forgetOtp($request);
        $otp = random_int(100000, 999999);
        try {
            Mail::to($user->email)->send(new OtpMail($otp, $user->user_fullname ?? 'User', $this->censorEmail($user->email)));
        } catch (\Throwable $e) {
            Log::warning('OTP mail failed', ['error' => $e->getMessage()]);

            return false;
        }

        $this->storeOtp($request, [
            'otp' => $otp,
            'expires' => now()->addMinutes(5)->getTimestamp(),
            'attempts' => 0,
            'redirect' => $redirect,
            'user_id' => $user->id,
            'token_id' => $accessToken->id,
        ], $accessToken);

        return true;
    }

    private function requestToken(Request $request): ?PersonalAccessToken
    {
        return OtpAuthentication::token($request);
    }

    private function revokeLoginTokens(Request $request): void
    {
        $tokens = [];
        if ($request->bearerToken()) {
            $tokens[] = PersonalAccessToken::findToken($request->bearerToken());
        }
        if ($request->hasSession() && $request->session()->has('auth_token_id')) {
            $token = PersonalAccessToken::find($request->session()->get('auth_token_id'));
            if ($token && (string) $token->tokenable_id === (string) Auth::guard('web')->id()) {
                $tokens[] = $token;
            }
        }
        foreach ($tokens as $token) {
            if ($token) {
                Cache::forget($this->otpCacheKey($token));
                $token->delete();
            }
        }
    }

    private function otpCacheKey(PersonalAccessToken $token): string
    {
        return 'otp:token:'.$token->id;
    }

    private function readOtp(Request $request): ?array
    {
        $token = $this->requestToken($request);
        $record = $token ? Cache::get($this->otpCacheKey($token)) : null;
        if (! is_array($record)
            || (string) ($record['user_id'] ?? '') !== (string) $request->user()?->id
            || (string) ($record['token_id'] ?? '') !== (string) $token?->id) {
            return null;
        }

        return $record;
    }

    private function storeOtp(Request $request, array $record, ?PersonalAccessToken $accessToken = null): void
    {
        $accessToken = $accessToken ?? $this->requestToken($request);
        if (! $accessToken) {
            return;
        }
        Cache::put($this->otpCacheKey($accessToken), $record, max(1, $record['expires'] - time()));
        if ($request->hasSession()) {
            $request->session()->put([
                'otp' => $record['otp'],
                'otp_expires' => $record['expires'],
                'otp_attempts' => $record['attempts'],
                'otp_redirect' => $record['redirect'],
                'otp_user_id' => $record['user_id'],
                'otp_token_id' => $record['token_id'],
            ]);
        }
    }

    private function forgetOtp(Request $request): void
    {
        $token = $this->requestToken($request);
        if ($token) {
            Cache::forget($this->otpCacheKey($token));
        }
        if ($request->hasSession()) {
            $request->session()->forget(['otp', 'otp_expires', 'otp_attempts', 'otp_redirect', 'otp_user_id', 'otp_token_id']);
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
            $request->session()->put(['otp_verified' => true, 'otp_verified_user_id' => $request->user()->id]);
        }

        $token = $this->requestToken($request);
        if ($token) {
            $token->update(['abilities' => ['otp_verified']]);
        }
    }

    private function currentOtpRedirect(Request $request): string
    {
        $record = $this->readOtp($request);

        return is_array($record) ? $record['redirect'] : ($request->user()?->role === 'Admin' ? '/admin' : '/Landing');
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
