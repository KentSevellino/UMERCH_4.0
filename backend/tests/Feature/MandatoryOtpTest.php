<?php

use App\Mail\OtpMail;
use App\Models\TrustedDevice;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\PersonalAccessToken;

function otpPolicyUser(int $number = 1): User
{
    return User::create([
        'um_id' => 9900 + $number,
        'email' => "otp-policy-{$number}@example.com",
        'user_fullname' => "OTP User {$number}",
        'user_password' => 'secret-password',
        'role' => 'customer',
        'status' => 'active',
    ]);
}

beforeEach(function () {
    Mail::fake();
    config(['sanctum.stateful' => ['localhost:5173']]);
});

it('keeps an abandoned browser login pending and requires otp again after cancellation', function () {
    $user = otpPolicyUser();
    TrustedDevice::create(['user_id' => $user->id, 'device_fingerprint' => hash('sha256', 'browser')]);
    $credentials = ['login' => $user->email, 'password' => 'secret-password', 'device_fingerprint' => 'browser'];
    $first = $this->withHeader('Origin', 'http://localhost:5173')->postJson('/api/login', $credentials)
        ->assertOk()->assertJsonPath('otp_required', true)->assertJsonPath('otp_verified', false);
    $token = $first->json('token');
    $tokenId = PersonalAccessToken::findToken($token)->id;

    $this->withToken($token)->getJson('/api/me')->assertOk()->assertJsonPath('otp_verified', false);
    foreach (['/api/cart', '/api/profile', '/api/trusted-devices'] as $path) {
        $this->getJson($path)->assertStatus(403);
    }
    $this->patchJson('/api/profile', ['user_fullname' => 'Not allowed'])->assertStatus(403);
    $this->postJson('/api/logout')->assertOk();
    expect(PersonalAccessToken::findToken($token))->toBeNull()
        ->and(Cache::get('otp:token:'.$tokenId))->toBeNull();

    $second = $this->postJson('/api/login', $credentials)->assertOk()->assertJsonPath('otp_required', true);
    $this->withToken($second->json('token'))->getJson('/api/me')->assertJsonPath('otp_verified', false);
    expect(TrustedDevice::count())->toBe(1);
    Mail::assertSent(OtpMail::class, 2);
});

it('only grants access after verification and requires a new challenge on the next login', function () {
    $user = otpPolicyUser();
    $credentials = ['login' => $user->email, 'password' => 'secret-password'];
    $response = $this->withHeader('Origin', 'http://localhost:5173')->postJson('/api/login', $credentials)->assertOk();
    $token = $response->json('token');
    $this->withToken($token)->postJson('/api/verify-otp', ['otp' => (string) Mail::sent(OtpMail::class)->last()->otp])
        ->assertOk()->assertJsonPath('otp_verified', true);
    $this->getJson('/api/me')->assertJsonPath('otp_verified', true);
    $this->getJson('/api/cart')->assertOk();
    expect(PersonalAccessToken::findToken($token)->abilities)->toBe(['otp_verified']);
    $this->postJson('/api/resend-otp')->assertStatus(409);
    $this->postJson('/api/logout')->assertOk();
    $this->postJson('/api/login', $credentials)->assertOk()->assertJsonPath('otp_required', true);
});

it('clears the old account grant and challenge when switching accounts in one browser', function () {
    $first = otpPolicyUser(1);
    $second = otpPolicyUser(2);
    $response = $this->withHeader('Origin', 'http://localhost:5173')->postJson('/api/login', [
        'login' => $first->email, 'password' => 'secret-password',
    ])->assertOk();
    $oldToken = $response->json('token');
    $oldOtp = (string) Mail::sent(OtpMail::class)->last()->otp;
    $this->withToken($oldToken)->postJson('/api/verify-otp', ['otp' => $oldOtp])->assertOk();
    $next = $this->postJson('/api/login', ['login' => $second->email, 'password' => 'secret-password'])
        ->assertOk()->assertJsonPath('otp_verified', false)->assertSessionMissing('otp_verified');
    expect(PersonalAccessToken::findToken($oldToken))->toBeNull();
    $newToken = $next->json('token');
    // Production requests resolve fresh guards; the test container caches them.
    Auth::forgetGuards();
    $this->withToken($newToken)->getJson('/api/me')->assertJsonPath('user.id', $second->id)->assertJsonPath('otp_verified', false);
    $this->getJson('/api/cart')->assertStatus(403);

    $tokenId = PersonalAccessToken::findToken($newToken)->id;
    $record = Cache::get('otp:token:'.$tokenId);
    $record['user_id'] = $first->id;
    Cache::put('otp:token:'.$tokenId, $record, 300);
    $this->postJson('/api/verify-otp', ['otp' => (string) $record['otp']])->assertStatus(422);
});

it('never accepts a session grant as a substitute for the presented unverified token', function () {
    $user = otpPolicyUser();
    $response = $this->withHeader('Origin', 'http://localhost:5173')->postJson('/api/login', [
        'login' => $user->email, 'password' => 'secret-password',
    ])->assertOk();
    $this->withSession(['otp_verified' => true])->withToken($response->json('token'))
        ->getJson('/api/cart')->assertStatus(403);
    $this->getJson('/api/me')->assertJsonPath('otp_verified', false);
});

it('supports cookie-only verification and revokes its issued token on logout', function () {
    $response = $this->withHeader('Origin', 'http://localhost:5173')->postJson('/api/login', [
        'login' => otpPolicyUser()->email, 'password' => 'secret-password',
    ])->assertOk();
    $this->postJson('/api/verify-otp', ['otp' => (string) Mail::sent(OtpMail::class)->last()->otp])->assertOk();
    $this->getJson('/api/me')->assertJsonPath('otp_verified', true);
    $this->postJson('/api/logout')->assertOk();
    expect(PersonalAccessToken::findToken($response->json('token')))->toBeNull();
});

it('requires otp for the mobile google endpoint even with a known fingerprint', function () {
    $user = otpPolicyUser();
    TrustedDevice::create(['user_id' => $user->id, 'device_fingerprint' => hash('sha256', 'browser')]);
    Http::fake(['oauth2.googleapis.com/*' => Http::response(['email' => $user->email])]);
    $this->postJson('/api/google-login', ['id_token' => 'test-token', 'device_fingerprint' => 'browser'])
        ->assertOk()->assertJsonPath('otp_required', true)->assertJsonPath('otp_verified', false);
});

it('rejects wrong expired and exhausted challenges and allows resending without granting access', function () {
    $response = $this->postJson('/api/login', ['login' => otpPolicyUser()->email, 'password' => 'secret-password'])->assertOk();
    $token = $response->json('token');
    $otp = (string) Mail::sent(OtpMail::class)->last()->otp;
    $wrong = $otp === '111111' ? '222222' : '111111';
    for ($attempt = 0; $attempt < 6; $attempt++) {
        $this->withToken($token)->postJson('/api/verify-otp', ['otp' => $wrong])->assertStatus(422);
    }
    $this->postJson('/api/verify-otp', ['otp' => $otp])->assertStatus(422);
    $this->postJson('/api/resend-otp')->assertOk();
    $this->getJson('/api/me')->assertJsonPath('otp_verified', false);
    $this->travel(6)->minutes();
    $this->postJson('/api/verify-otp', ['otp' => (string) Mail::sent(OtpMail::class)->last()->otp])->assertStatus(422);
    $this->travelBack();
    $this->postJson('/api/resend-otp')->assertOk();
    $this->postJson('/api/verify-otp', ['otp' => (string) Mail::sent(OtpMail::class)->last()->otp])->assertOk();
});

it('does not leave an authenticated token or session after initial mail delivery fails', function () {
    $user = otpPolicyUser();
    Mail::shouldReceive('to')->andThrow(new RuntimeException('SMTP details must stay private'));
    $this->withHeader('Origin', 'http://localhost:5173')->postJson('/api/login', [
        'login' => $user->email, 'password' => 'secret-password',
    ])->assertStatus(503)->assertJsonMissingPath('token')->assertSessionMissing('otp_verified');
    expect(PersonalAccessToken::count())->toBe(0)
        ->and(Auth::guard('web')->check())->toBeFalse();
});

it('keeps a failed resend pending and invalidates the previous code', function () {
    $response = $this->postJson('/api/login', ['login' => otpPolicyUser()->email, 'password' => 'secret-password'])->assertOk();
    $token = $response->json('token');
    $otp = (string) Mail::sent(OtpMail::class)->last()->otp;
    Mail::shouldReceive('to')->andThrow(new RuntimeException('SMTP failed'));
    $this->withToken($token)->postJson('/api/resend-otp')->assertStatus(503);
    $this->postJson('/api/verify-otp', ['otp' => $otp])->assertStatus(422);
    $this->getJson('/api/me')->assertJsonPath('otp_verified', false);
});
