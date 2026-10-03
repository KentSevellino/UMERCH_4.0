<?php

use App\Mail\OtpMail;
use App\Models\User;
use Database\Seeders\AccountSeeder;
use Illuminate\Support\Facades\Mail;

const SEEDED_LOGINS = [
    'admin@umerch.com',
    'yoshbatula2@gmail.com',
    'y.batula.544580@umindanao.edu.ph',
    'inactive.tester@example.com',
];

it('creates every known account and can be run twice', function () {
    $this->seed(AccountSeeder::class);
    $this->seed(AccountSeeder::class);

    expect(User::count())->toBe(count(SEEDED_LOGINS));

    foreach (SEEDED_LOGINS as $email) {
        expect(User::where('email', $email)->exists())->toBeTrue();
    }
});

it('keeps the reserved administrator identity reserved', function () {
    $this->seed(AccountSeeder::class);

    $admin = User::where('email', 'admin@umerch.com')->first();

    expect($admin->um_id)->toBe(1)
        ->and($admin->user_fullname)->toBe('Admin')
        ->and($admin->role)->toBe('Admin')
        ->and($admin->status)->toBe('active');
});

it('deactivates exactly one seeded account', function () {
    $this->seed(AccountSeeder::class);

    expect(User::where('status', 'inactive')->pluck('email')->all())
        ->toBe(['inactive.tester@example.com']);
});

it('signs a seeded customer in the same way from either client', function () {
    $this->seed(AccountSeeder::class);
    Mail::fake();

    $response = $this->postJson('/api/login', [
        'login' => 'yoshbatula2@gmail.com',
        'password' => AccountSeeder::PASSWORD,
    ]);

    $response->assertOk()->assertJson([
        'otp_required' => true,
        'redirect' => '/authentication',
    ]);

    Mail::assertSent(OtpMail::class, fn ($mail) => $mail->hasTo('yoshbatula2@gmail.com'));
});

it('refuses a seeded account that an administrator deactivated', function () {
    $this->seed(AccountSeeder::class);

    $this->postJson('/api/login', [
        'login' => 'inactive.tester@example.com',
        'password' => AccountSeeder::PASSWORD,
    ])->assertStatus(422)->assertJson([
        'message' => 'Your account has been deactivated. Please contact an administrator.',
    ]);
});
