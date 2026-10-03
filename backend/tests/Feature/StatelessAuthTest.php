<?php

use App\Mail\OtpMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

function statelessUser(array $attributes = []): User
{
    static $sequence = 0;
    $sequence++;

    return User::create($attributes + [
        'um_id' => 9700 + $sequence,
        'email' => "stateless-user-{$sequence}@example.com",
        'user_fullname' => "Stateless User {$sequence}",
        'user_password' => 'secret-password',
        'role' => 'customer',
        'status' => 'active',
    ]);
}

/**
 * Sign a client in the way a native app does: no Origin header, so the
 * request is never treated as stateful and no session is ever started.
 */
function statelessLogin(TestCase $test, User $user, string $password = 'secret-password')
{
    return $test->postJson('/api/login', [
        'login' => $user->email,
        'password' => $password,
    ]);
}

function statelessOtp(): string
{
    return (string) Mail::sent(OtpMail::class)->last()->otp;
}

it('signs a stateless client in without ever starting a session', function () {
    $user = statelessUser();

    $response = statelessLogin($this, $user);

    $response->assertOk()->assertJson([
        'otp_required' => true,
        'redirect' => '/authentication',
    ]);

    expect($response->json('token'))->toBeString()
        ->and($response->json('user.email'))->toBe($user->email)
        ->and($response->json('email'))->not->toBe($user->email);
});

it('emails a one time code to a stateless client', function () {
    Mail::fake();

    $user = statelessUser();

    statelessLogin($this, $user);

    Mail::assertSent(OtpMail::class, fn ($mail) => $mail->hasTo($user->email));

    expect(statelessOtp())->toHaveLength(6);
});

it('holds a stateless client back from protected routes until the code is confirmed', function () {
    Mail::fake();

    $token = statelessLogin($this, statelessUser())->json('token');

    $this->withToken($token)
        ->getJson('/api/cart')
        ->assertStatus(403)
        ->assertJson(['message' => 'OTP verification required']);
});

it('opens protected routes to a stateless client once the code is confirmed', function () {
    Mail::fake();

    $user = statelessUser();
    $token = statelessLogin($this, $user)->json('token');

    $this->withToken($token)
        ->postJson('/api/verify-otp', ['otp' => statelessOtp()])
        ->assertOk()
        ->assertJson([
            'message' => 'OTP verified successfully',
            'redirect' => '/Landing',
        ]);

    $this->withToken($token)->getJson('/api/cart')->assertOk();
    $this->withToken($token)->getJson('/api/me')
        ->assertOk()
        ->assertJsonPath('user.email', $user->email);
});

it('still rejects a wrong code for a stateless client', function () {
    Mail::fake();

    $token = statelessLogin($this, statelessUser())->json('token');
    $wrong = statelessOtp() === '111111' ? '222222' : '111111';

    $this->withToken($token)
        ->postJson('/api/verify-otp', ['otp' => $wrong])
        ->assertStatus(422)
        ->assertJson(['message' => 'Invalid OTP.']);

    $this->withToken($token)
        ->getJson('/api/cart')
        ->assertStatus(403);
});

it('resends a fresh code to a stateless client', function () {
    Mail::fake();

    $token = statelessLogin($this, statelessUser())->json('token');
    $first = statelessOtp();

    $this->withToken($token)
        ->postJson('/api/resend-otp')
        ->assertOk()
        ->assertJson(['message' => 'OTP resent successfully']);

    Mail::assertSent(OtpMail::class, 2);

    $second = statelessOtp();
    expect($second)->not->toBe($first);

    $this->withToken($token)
        ->postJson('/api/verify-otp', ['otp' => $second])
        ->assertOk();
});

it('logs a stateless client out without a session', function () {
    Mail::fake();

    $token = statelessLogin($this, statelessUser())->json('token');

    $this->withToken($token)
        ->postJson('/api/logout')
        ->assertOk()
        ->assertJson(['message' => 'Logged out successfully']);

    // The credential itself is gone. (The guard instance is cached for the
    // life of the test's application, so a follow up request would still see
    // the user it resolved earlier — that is an artefact of the harness, not
    // of the endpoint.)
    expect(PersonalAccessToken::count())->toBe(0);
});

it('logs a stateful client out', function () {
    Mail::fake();

    $origin = ['Origin' => 'http://localhost:5173'];
    $token = $this->withHeaders($origin)
        ->postJson('/api/login', [
            'login' => statelessUser()->email,
            'password' => 'secret-password',
        ])
        ->json('token');

    $this->withHeaders($origin)->withToken($token)
        ->postJson('/api/logout')
        ->assertOk()
        ->assertJson(['message' => 'Logged out successfully']);
});

it('refuses a token that was never handed an otp grant', function () {
    $user = statelessUser();

    // Sanctum mints tokens with `['*']` abilities by default and treats `*`
    // as every ability, which would otherwise let this straight through.
    $token = $user->createToken('auth-token')->plainTextToken;

    $this->withToken($token)
        ->getJson('/api/cart')
        ->assertStatus(403)
        ->assertJson(['message' => 'OTP verification required']);
});

it('refuses a deactivated account', function () {
    $user = statelessUser(['status' => 'inactive']);

    statelessLogin($this, $user)
        ->assertStatus(422)
        ->assertJson([
            'message' => 'Your account has been deactivated. Please contact an administrator.',
        ]);
});
