<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;

function adminUserManagementAdmin(): User
{
    static $sequence = 0;
    $sequence++;

    return User::create([
        'um_id' => 9100 + $sequence,
        'email' => "user-admin-{$sequence}@example.com",
        'user_fullname' => "User Admin {$sequence}",
        'user_password' => 'secret-password',
        'role' => 'Admin',
        'status' => 'active',
    ]);
}

function adminUserManagementCustomer(array $attributes = []): User
{
    static $sequence = 0;
    $sequence++;

    return User::create($attributes + [
        'um_id' => 9300 + $sequence,
        'email' => "user-customer-{$sequence}@example.com",
        'user_fullname' => "User Customer {$sequence}",
        'user_password' => 'secret-password',
        'role' => 'customer',
        'status' => 'active',
    ]);
}

beforeEach(function () {
    $this->withSession(['otp_verified' => true]);
});

it('requires authentication to create a user', function () {
    $this->postJson('/api/admin/users', [
        'user_fullname' => 'New Student',
        'email' => 'student@example.com',
        'um_id' => 123,
        'user_password' => 'secret123',
    ])->assertUnauthorized();
});

it('rejects a non admin from creating a user', function () {
    Sanctum::actingAs(adminUserManagementCustomer());

    $this->postJson('/api/admin/users', [
        'user_fullname' => 'New Student',
        'email' => 'student@example.com',
        'um_id' => 123,
        'user_password' => 'secret123',
    ])->assertForbidden();
});

it('creates a new user', function () {
    Sanctum::actingAs(adminUserManagementAdmin());

    $response = $this->postJson('/api/admin/users', [
        'user_fullname' => 'New Student',
        'email' => 'student@example.com',
        'um_id' => 123,
        'user_password' => 'secret123',
    ])->assertCreated();

    $response->assertJson(['message' => 'User created successfully']);

    $this->assertDatabaseHas('users', [
        'email' => 'student@example.com',
        'um_id' => 123,
        'role' => 'customer',
        'status' => 'active',
    ]);
});

it('stores a user id that was submitted with leading zeros', function () {
    Sanctum::actingAs(adminUserManagementAdmin());

    $this->postJson('/api/admin/users', [
        'user_fullname' => 'Leading Zero Student',
        'email' => 'leading-zero@example.com',
        'um_id' => '0123',
        'user_password' => 'secret123',
    ])->assertCreated();

    $this->assertDatabaseHas('users', [
        'email' => 'leading-zero@example.com',
        'um_id' => 123,
    ]);
});

it('rejects a duplicate user id', function () {
    $existing = adminUserManagementCustomer();
    Sanctum::actingAs(adminUserManagementAdmin());

    $response = $this->postJson('/api/admin/users', [
        'user_fullname' => 'Duplicate Id Student',
        'email' => 'duplicate-id@example.com',
        'um_id' => $existing->um_id,
        'user_password' => 'secret123',
    ])->assertStatus(422);

    expect($response->json('errors.um_id'))->toBeArray()
        ->and($response->json('errors.um_id')[0])->toContain('already in use');
});

it('rejects a duplicate email', function () {
    $existing = adminUserManagementCustomer();
    Sanctum::actingAs(adminUserManagementAdmin());

    $response = $this->postJson('/api/admin/users', [
        'user_fullname' => 'Duplicate Email Student',
        'email' => $existing->email,
        'um_id' => 456,
        'user_password' => 'secret123',
    ])->assertStatus(422);

    expect($response->json('errors.email'))->toBeArray();
});

it('rejects a duplicate full name instead of crashing with a server error', function () {
    $existing = adminUserManagementCustomer();
    Sanctum::actingAs(adminUserManagementAdmin());

    $response = $this->postJson('/api/admin/users', [
        'user_fullname' => $existing->user_fullname,
        'email' => 'duplicate-name@example.com',
        'um_id' => 456,
        'user_password' => 'secret123',
    ])->assertStatus(422);

    expect($response->json('errors.user_fullname'))->toBeArray()
        ->and($response->json('errors.user_fullname')[0])->toContain('taken');
});

it('rejects a user id that is not a whole number', function () {
    Sanctum::actingAs(adminUserManagementAdmin());

    $response = $this->postJson('/api/admin/users', [
        'user_fullname' => 'Bad Id Student',
        'email' => 'bad-id@example.com',
        'um_id' => 'abc123',
        'user_password' => 'secret123',
    ])->assertStatus(422);

    expect($response->json('errors.um_id'))->toBeArray()
        ->and($response->json('errors.um_id')[0])->toBe('User ID must be a whole number.');
});

it('rejects a user id that overflows the users table integer column', function () {
    Sanctum::actingAs(adminUserManagementAdmin());

    $response = $this->postJson('/api/admin/users', [
        'user_fullname' => 'Huge Id Student',
        'email' => 'huge-id@example.com',
        'um_id' => '999999999999',
        'user_password' => 'secret123',
    ])->assertStatus(422);

    expect($response->json('errors.um_id'))->toBeArray();
});

it('rejects a password that is too short', function () {
    Sanctum::actingAs(adminUserManagementAdmin());

    $response = $this->postJson('/api/admin/users', [
        'user_fullname' => 'Short Password Student',
        'email' => 'short-password@example.com',
        'um_id' => 789,
        'user_password' => 'abc',
    ])->assertStatus(422);

    expect($response->json('errors.user_password'))->toBeArray();
});

it('updates a user with the documented field names', function () {
    $customer = adminUserManagementCustomer();
    Sanctum::actingAs(adminUserManagementAdmin());

    $this->patchJson("/api/admin/users/{$customer->id}", [
        'user_fullname' => 'Renamed Customer',
        'email' => 'renamed@example.com',
        'um_id' => '0555',
        'user_password' => 'new-secret-123',
    ])->assertOk();

    $this->assertDatabaseHas('users', [
        'id' => $customer->id,
        'user_fullname' => 'Renamed Customer',
        'email' => 'renamed@example.com',
        'um_id' => 555,
    ]);

    expect(Hash::check(
        'new-secret-123',
        User::find($customer->id)->user_password
    ))->toBeTrue();
});

it('rejects an update that reuses another users user id', function () {
    $taken = adminUserManagementCustomer();
    $customer = adminUserManagementCustomer();
    Sanctum::actingAs(adminUserManagementAdmin());

    $response = $this->patchJson("/api/admin/users/{$customer->id}", [
        'um_id' => $taken->um_id,
    ])->assertStatus(422);

    expect($response->json('errors.um_id'))->toBeArray();
});

it('does not change the password when an empty password is submitted', function () {
    $customer = adminUserManagementCustomer(['user_password' => 'original-secret']);
    Sanctum::actingAs(adminUserManagementAdmin());

    $this->patchJson("/api/admin/users/{$customer->id}", [
        'user_fullname' => 'Kept Password Customer',
        'email' => $customer->email,
        'um_id' => $customer->um_id,
        'user_password' => '',
    ])->assertOk();

    expect(Hash::check(
        'original-secret',
        User::find($customer->id)->user_password
    ))->toBeTrue();
});
