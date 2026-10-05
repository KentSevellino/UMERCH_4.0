<?php

use App\Mail\OtpMail;
use App\Models\Carts;
use App\Models\Carts_Item;
use App\Models\Inventory;
use App\Models\Products;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * The OTP grant is confirmed lazily rather than in beforeEach: Sanctum's
 * RequestGuard caches the user it resolves for the whole test, so the guard
 * has to see the token in the state each assertion is about.
 */
function confirmCartOtp(TestCase $test, string $token): void
{
    $test->withToken($token)
        ->postJson('/api/verify-otp', [
            'otp' => Mail::sent(OtpMail::class)->last()->otp,
        ])
        ->assertOk();
}

function cartUser(int $umId, string $email): User
{
    return User::create([
        'um_id' => $umId,
        'email' => $email,
        'user_fullname' => 'Cart Quantity Tester',
        'user_password' => 'secret-password',
        'role' => 'customer',
        'status' => 'active',
    ]);
}

function signInCartUser(TestCase $test, User $user): string
{
    return $test->postJson('/api/login', [
        'login' => $user->email,
        'password' => 'secret-password',
    ])->assertOk()->json('token');
}

beforeEach(function () {
    Mail::fake();

    $this->user = cartUser(980001, 'cart-quantity@example.com');
    $this->token = signInCartUser($this, $this->user);

    $this->product = Products::create([
        'product_name' => 'cart quantity product',
        'product_price' => 500,
        'product_stock' => 10,
        'variant' => 'size',
        'variant_type' => 'size',
        'status' => 'active',
    ]);

    Inventory::create([
        'product_id' => $this->product->product_id,
        'variant' => 'M',
        'quantity' => 5,
        'status' => 'active',
    ]);

    $this->cart = Carts::create(['user_id' => $this->user->id]);

    $this->item = Carts_Item::create([
        'cart_id' => $this->cart->cart_id,
        'product_id' => $this->product->product_id,
        'variant' => 'M',
        'quantity' => 2,
        'price' => 500,
    ]);
});

it('changes only the quantity when a quantity is sent', function () {
    confirmCartOtp($this, $this->token);

    $this->withToken($this->token)
        ->putJson("/api/cart/{$this->item->cart_item_id}", ['quantity' => 4])
        ->assertOk()
        ->assertJson(['message' => 'Item updated successfully']);

    $this->item->refresh();

    expect((int) $this->item->quantity)->toBe(4)
        ->and($this->item->variant)->toBe('M');
});

it('still changes only the variant when no quantity is sent', function () {
    confirmCartOtp($this, $this->token);

    $this->withToken($this->token)
        ->putJson("/api/cart/{$this->item->cart_item_id}", ['variant' => 'XL'])
        ->assertOk()
        ->assertJson(['message' => 'Item updated successfully']);

    $this->item->refresh();

    expect($this->item->variant)->toBe('XL')
        ->and((int) $this->item->quantity)->toBe(2);
});

it('refuses a quantity beyond the stock available for the variant', function () {
    confirmCartOtp($this, $this->token);

    $this->withToken($this->token)
        ->putJson("/api/cart/{$this->item->cart_item_id}", ['quantity' => 99])
        ->assertStatus(400)
        ->assertJson([
            'message' => 'Insufficient stock available',
            'requested' => 99,
            'available_stock' => 5,
        ]);

    expect((int) $this->item->refresh()->quantity)->toBe(2);
});

it('falls back to the product stock when the variant has no inventory row', function () {
    confirmCartOtp($this, $this->token);

    $this->withToken($this->token)
        ->putJson("/api/cart/{$this->item->cart_item_id}", ['variant' => 'XXL'])
        ->assertOk();

    $this->withToken($this->token)
        ->putJson("/api/cart/{$this->item->cart_item_id}", ['quantity' => 8])
        ->assertOk();

    expect((int) $this->item->refresh()->quantity)->toBe(8);
});

it('rejects an update that carries neither field', function () {
    confirmCartOtp($this, $this->token);

    $this->withToken($this->token)
        ->putJson("/api/cart/{$this->item->cart_item_id}", [])
        ->assertStatus(422);

    expect((int) $this->item->refresh()->quantity)->toBe(2);
});

it('refuses a cart quantity change before the code is confirmed', function () {
    $this->withToken($this->token)
        ->putJson("/api/cart/{$this->item->cart_item_id}", ['quantity' => 3])
        ->assertStatus(403)
        ->assertJson(['message' => 'OTP verification required']);

    expect((int) $this->item->refresh()->quantity)->toBe(2);
});
