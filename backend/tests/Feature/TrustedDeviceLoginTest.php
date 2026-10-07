<?php

use App\Models\TrustedDevice;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\Mail;

function trustedDeviceUser(int $number): User
{
    return User::create([
        'um_id' => 9800 + $number,
        'email' => "trusted-device-{$number}@example.com",
        'user_fullname' => "Device User {$number}",
        'user_password' => 'secret-password',
        'role' => 'customer',
        'status' => 'active',
    ]);
}

beforeEach(function () {
    Mail::fake();
});

it('enforces one row per account and fingerprint', function () {
    $user = trustedDeviceUser(1);
    $attributes = ['user_id' => $user->id, 'device_fingerprint' => hash('sha256', 'browser')];
    TrustedDevice::create($attributes);

    expect(fn () => TrustedDevice::create($attributes))->toThrow(UniqueConstraintViolationException::class);
});

it('does not expose a remembered account or grant trust from a fingerprint', function () {
    $user = trustedDeviceUser(1);
    TrustedDevice::create(['user_id' => $user->id, 'device_fingerprint' => hash('sha256', 'browser')]);
    $this->postJson('/api/check-trusted-device', ['fingerprint' => 'browser'])
        ->assertOk()->assertExactJson(['trusted' => false]);
});

it('preserves existing devices when migrating the unique constraint', function () {
    $migration = require database_path('migrations/2026_10_07_000001_scope_trusted_device_fingerprints_to_users.php');
    $migration->down();
    $first = trustedDeviceUser(1);
    $second = trustedDeviceUser(2);
    $device = TrustedDevice::create([
        'user_id' => $first->id,
        'device_fingerprint' => hash('sha256', 'existing-browser'),
    ]);

    $migration->up();
    expect($device->fresh()->user_id)->toBe($first->id);
    TrustedDevice::create(['user_id' => $second->id, 'device_fingerprint' => $device->device_fingerprint]);

    expect(fn () => $migration->down())->toThrow(RuntimeException::class);
    expect(TrustedDevice::count())->toBe(2);
});
