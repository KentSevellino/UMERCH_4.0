<?php

use App\Mail\OtpMail;
use App\Models\TrustedDevice;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Testing\TestResponse;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\AbstractProvider;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;

const FRONTEND_ORIGIN = ['Origin' => 'http://localhost:5173'];

function googleCallbackUser(?string $email): void
{
    $googleUser = new SocialiteUser;
    $googleUser->map([
        'id' => 'google-123',
        'name' => 'Google User',
        'email' => $email,
    ]);

    Socialite::shouldReceive('driver')->with('google')->andReturn($mock = Mockery::mock(AbstractProvider::class));
    $mock->shouldReceive('stateless')->andReturnSelf();
    $mock->shouldReceive('user')->andReturn($googleUser);
}

function googleCallbackLocation(TestResponse $response): string
{
    return (string) $response->headers->get('Location');
}

function googleUser(array $attributes = []): User
{
    static $sequence = 0;
    $sequence++;

    return User::create($attributes + [
        'um_id' => 9500 + $sequence,
        'email' => "google-user-{$sequence}@example.com",
        'user_fullname' => "Google User {$sequence}",
        'user_password' => 'secret-password',
        'role' => 'customer',
        'status' => 'active',
    ]);
}

it('rejects a google email that is not in the users table', function () {
    googleCallbackUser('stranger@example.com');

    $response = $this->get('/api/auth/google/callback');

    expect(googleCallbackLocation($response))
        ->toContain('/auth/callback?error=no_account');
});

it('rejects an inactive user', function () {
    $user = googleUser(['status' => 'inactive']);
    googleCallbackUser($user->email);

    $response = $this->get('/api/auth/google/callback');

    expect(googleCallbackLocation($response))
        ->toContain('/auth/callback?error=inactive');
});

it('issues a one-time code for an existing active user', function () {
    $user = googleUser();
    googleCallbackUser($user->email);

    $response = $this->get('/api/auth/google/callback');
    $location = googleCallbackLocation($response);

    expect($location)->toContain('/auth/callback?code=');

    $code = parse_url($location, PHP_URL_QUERY);
    parse_str((string) $code, $query);

    expect($query['code'])->toBeString()->not->toBeEmpty();
});

it('requires an otp after a google admin sign in and unlocks the admin api once verified', function () {
    Mail::fake();

    $admin = googleUser(['role' => 'Admin']);
    $code = 'valid-admin-code';
    cache()->put("google_login:{$code}", [
        'user_id' => $admin->id,
        'redirect' => '/admin',
    ], now()->addMinute());

    $response = $this->withHeaders(FRONTEND_ORIGIN)
        ->postJson('/api/auth/exchange', ['code' => $code])
        ->assertOk()
        ->assertJson([
            'otp_required' => true,
            'redirect' => '/authentication',
        ])
        ->assertJsonStructure(['user', 'token', 'otp_required', 'email', 'redirect']);

    expect($response->json('user.email'))->toBe($admin->email);
    Mail::assertSent(OtpMail::class, function ($mail) use ($admin) {
        return $mail->hasTo($admin->email)
            && $mail->maskedEmail !== ''
            && $mail->maskedEmail !== $admin->email
            && str_contains($mail->maskedEmail, '*');
    });

    $masked = $response->json('email');
    expect($masked)->not->toBe($admin->email);
    expect($masked)->toContain('*')->toEndWith('@'.explode('@', $admin->email)[1]);

    $token = $response->json('token');

    $this->withToken($token)
        ->getJson('/api/admin/users')
        ->assertStatus(403)
        ->assertJson(['message' => 'OTP verification required']);

    $otp = session('otp');
    expect($otp)->toBeInt();

    $this->withToken($token)
        ->postJson('/api/verify-otp', ['otp' => (string) $otp])
        ->assertOk()
        ->assertJson(['redirect' => '/admin']);

    $this->withToken($token)
        ->getJson('/api/admin/users')
        ->assertOk();
});

it('redirects customers to otp verification after a google sign in', function () {
    $user = googleUser();
    $code = 'valid-customer-code';
    cache()->put("google_login:{$code}", [
        'user_id' => $user->id,
        'redirect' => '/Landing',
    ], now()->addMinute());

    $this->withHeaders(FRONTEND_ORIGIN)
        ->postJson('/api/auth/exchange', ['code' => $code])
        ->assertOk()
        ->assertJson([
            'otp_required' => true,
            'redirect' => '/authentication',
        ]);

    expect(session('otp_redirect'))->toBe('/Landing');
});

it('rejects an invalid or expired code', function () {
    $this->postJson('/api/auth/exchange', ['code' => 'does-not-exist'])
        ->assertStatus(422)
        ->assertJsonStructure(['message']);
});

it('rejects a google sign in when no browser session is available', function () {
    $user = googleUser();
    $code = 'stateless-exchange-code';
    cache()->put("google_login:{$code}", [
        'user_id' => $user->id,
        'redirect' => '/Landing',
    ], now()->addMinute());

    $this->postJson('/api/auth/exchange', ['code' => $code])
        ->assertStatus(422)
        ->assertJson(['message' => 'Your browser session could not be started. Please try signing in again.']);
});

it('stores a pending otp for the frontend origin instead of marking it verified', function () {
    $user = googleUser();
    $code = 'stateful-origin-code';
    cache()->put("google_login:{$code}", [
        'user_id' => $user->id,
        'redirect' => '/Landing',
    ], now()->addMinute());

    $this->withHeaders(FRONTEND_ORIGIN)
        ->postJson('/api/auth/exchange', ['code' => $code])
        ->assertOk()
        ->assertSessionHas('otp')
        ->assertSessionMissing('otp_verified');
});

it('skips the otp for a device that was already trusted', function () {
    $user = googleUser();
    $fingerprint = 'trusted-google-device';

    TrustedDevice::create([
        'user_id' => $user->id,
        'device_fingerprint' => hash('sha256', $fingerprint),
        'device_name' => 'Trusted laptop',
        'ip_address' => '127.0.0.1',
        'user_agent' => 'Pest',
        'last_used_at' => now(),
    ]);

    $code = 'trusted-device-code';
    cache()->put("google_login:{$code}", [
        'user_id' => $user->id,
        'redirect' => '/Landing',
    ], now()->addMinute());

    $this->withHeaders(FRONTEND_ORIGIN)
        ->postJson('/api/auth/exchange', [
            'code' => $code,
            'device_fingerprint' => $fingerprint,
        ])
        ->assertOk()
        ->assertJson([
            'otp_verified' => true,
            'redirect' => '/Landing',
        ])
        ->assertSessionHas('otp_verified', true);
});

it('registers a new device on google sign in but still requires the otp', function () {
    $user = googleUser();
    $fingerprint = 'brand-new-google-device';

    $code = 'new-device-code';
    cache()->put("google_login:{$code}", [
        'user_id' => $user->id,
        'redirect' => '/Landing',
    ], now()->addMinute());

    $this->withHeaders(FRONTEND_ORIGIN)
        ->postJson('/api/auth/exchange', [
            'code' => $code,
            'device_fingerprint' => $fingerprint,
        ])
        ->assertOk()
        ->assertJson(['otp_required' => true])
        ->assertSessionMissing('otp_verified');

    $this->assertDatabaseHas('trusted_devices', [
        'user_id' => $user->id,
        'device_fingerprint' => hash('sha256', $fingerprint),
    ]);
});

it('allows the seeded admin password login to reach the admin api without an otp', function () {
    $response = $this->withHeaders(FRONTEND_ORIGIN)
        ->postJson('/api/login', ['login' => 'admin', 'password' => 'umerch2026'])
        ->assertOk();

    expect($response->json('redirect'))->toBe('/admin');

    $this->withToken($response->json('token'))
        ->getJson('/api/admin/users')
        ->assertOk();
});

it('sends an admin password login through otp and returns them to the admin dashboard', function () {
    Mail::fake();

    $admin = googleUser(['role' => 'Admin']);

    $response = $this->withHeaders(FRONTEND_ORIGIN)
        ->postJson('/api/login', [
            'login' => $admin->email,
            'password' => 'secret-password',
        ])
        ->assertOk()
        ->assertJson([
            'otp_required' => true,
            'redirect' => '/authentication',
        ]);

    Mail::assertSent(OtpMail::class, function ($mail) use ($admin) {
        return $mail->hasTo($admin->email)
            && $mail->maskedEmail !== ''
            && $mail->maskedEmail !== $admin->email
            && str_contains($mail->maskedEmail, '*');
    });

    $masked = $response->json('email');
    expect($masked)->not->toBe($admin->email);
    expect($masked)->toContain('*')->toEndWith('@'.explode('@', $admin->email)[1]);

    $token = $response->json('token');

    $this->withToken($token)
        ->getJson('/api/admin/users')
        ->assertStatus(403)
        ->assertJson(['message' => 'OTP verification required']);

    $this->withToken($token)
        ->postJson('/api/verify-otp', ['otp' => (string) session('otp')])
        ->assertOk()
        ->assertJson(['redirect' => '/admin']);

    $this->withToken($token)
        ->getJson('/api/admin/users')
        ->assertOk();
});

it('only allows a code to be used once', function () {
    $user = googleUser();
    $code = 'single-use-code';
    cache()->put("google_login:{$code}", [
        'user_id' => $user->id,
        'redirect' => '/Landing',
    ], now()->addMinute());

    $this->withHeaders(FRONTEND_ORIGIN)->postJson('/api/auth/exchange', ['code' => $code])->assertOk();
    $this->withHeaders(FRONTEND_ORIGIN)->postJson('/api/auth/exchange', ['code' => $code])->assertStatus(422);
});

it('rejects exchanging a code for a user that became inactive', function () {
    $user = googleUser(['status' => 'inactive']);
    $code = 'inactive-user-code';
    cache()->put("google_login:{$code}", [
        'user_id' => $user->id,
        'redirect' => '/Landing',
    ], now()->addMinute());

    $this->postJson('/api/auth/exchange', ['code' => $code])->assertStatus(422);
});
