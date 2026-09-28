<?php

use App\Models\User;
use Illuminate\Testing\TestResponse;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\AbstractProvider;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;

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

it('exchanges a valid code for a token and redirects admins to the dashboard', function () {
    $admin = googleUser(['role' => 'Admin']);
    $code = 'valid-admin-code';
    cache()->put("google_login:{$code}", [
        'user_id' => $admin->id,
        'redirect' => '/admin',
    ], now()->addMinute());

    $response = $this->postJson('/api/auth/exchange', ['code' => $code])
        ->assertOk()
        ->assertJson([
            'otp_verified' => true,
            'redirect' => '/admin',
        ])
        ->assertJsonStructure(['user', 'token', 'otp_verified', 'redirect']);

    expect($response->json('user.email'))->toBe($admin->email);

    $this->withToken($response->json('token'))
        ->getJson('/api/admin/users')
        ->assertOk();
});

it('redirects customers to the landing page and marks otp verified', function () {
    $user = googleUser();
    $code = 'valid-customer-code';
    cache()->put("google_login:{$code}", [
        'user_id' => $user->id,
        'redirect' => '/Landing',
    ], now()->addMinute());

    $this->postJson('/api/auth/exchange', ['code' => $code])
        ->assertOk()
        ->assertJson([
            'otp_verified' => true,
            'redirect' => '/Landing',
        ]);
});

it('rejects an invalid or expired code', function () {
    $this->postJson('/api/auth/exchange', ['code' => 'does-not-exist'])
        ->assertStatus(422)
        ->assertJsonStructure(['message']);
});

it('sets the server-side otp session when requested from the frontend origin', function () {
    $user = googleUser();
    $code = 'stateful-origin-code';
    cache()->put("google_login:{$code}", [
        'user_id' => $user->id,
        'redirect' => '/Landing',
    ], now()->addMinute());

    $this->withHeaders(['Origin' => 'http://localhost:5173'])
        ->postJson('/api/auth/exchange', ['code' => $code])
        ->assertOk()
        ->assertSessionHas('otp_verified', true);
});

it('only allows a code to be used once', function () {
    $user = googleUser();
    $code = 'single-use-code';
    cache()->put("google_login:{$code}", [
        'user_id' => $user->id,
        'redirect' => '/Landing',
    ], now()->addMinute());

    $this->postJson('/api/auth/exchange', ['code' => $code])->assertOk();
    $this->postJson('/api/auth/exchange', ['code' => $code])->assertStatus(422);
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
