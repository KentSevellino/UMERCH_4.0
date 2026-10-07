<?php

use App\Models\Inventory;
use App\Models\Products;
use App\Models\StockIn;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

function inventoryStatusAdmin(): User
{
    static $sequence = 0;
    $sequence++;

    return User::create([
        'um_id' => 9000 + $sequence,
        'email' => "inventory-admin-{$sequence}@example.com",
        'user_fullname' => "Inventory Admin {$sequence}",
        'user_password' => 'secret-password',
        'role' => 'Admin',
        'status' => 'active',
    ]);
}

function inventoryProduct(array $attributes, ?int $quantity = null): Products
{
    static $sequence = 0;
    $sequence++;

    $product = Products::create($attributes + [
        'product_name' => "Product {$sequence}",
        'product_price' => 100,
        'product_stock' => 0,
        'variant' => 'size',
        'status' => 'active',
    ]);

    if ($quantity !== null) {
        Inventory::create([
            'product_id' => $product->product_id,
            'variant' => 'size',
            'quantity' => $quantity,
            'status' => 'active',
        ]);
    }

    return $product;
}

beforeEach(function () {
    // Session verification belongs to a stateful browser request.
    $this->withHeader('Origin', 'http://localhost:5173');
    $this->withSession(['otp_verified' => true]);
});

it('classifies products and returns percentages that match the counts', function () {
    inventoryProduct(['product_name' => 'In stock'], 50);
    inventoryProduct(['product_name' => 'Low stock'], 20);
    inventoryProduct(['product_name' => 'Out of stock'], 0);
    inventoryProduct(['product_name' => 'Fallback to product_stock', 'product_stock' => 25]);
    inventoryProduct(['product_name' => 'Archived', 'status' => 'archived'], 100);

    Sanctum::actingAs(inventoryStatusAdmin());

    $response = $this->getJson('/api/admin/dashboard/inventory-status')->assertOk();

    $response->assertJson([
        'inStock' => 2,
        'lowStock' => 1,
        'outOfStock' => 1,
        'total' => 4,
        'inStockPercent' => 50,
        'lowStockPercent' => 25,
        'outOfStockPercent' => 25,
    ]);

    $percentSum = $response->json('inStockPercent')
        + $response->json('lowStockPercent')
        + $response->json('outOfStockPercent');

    expect(round($percentSum, 1))->toBe(100.0);
});

it('counts products above the low-stock threshold as in stock', function () {
    inventoryProduct(['product_name' => 'Plenty of stock'], 100);

    Sanctum::actingAs(inventoryStatusAdmin());

    $response = $this->getJson('/api/admin/dashboard/inventory-status')->assertOk();

    expect($response->json('inStock'))->toBe(1)
        ->and($response->json('lowStock'))->toBe(0)
        ->and($response->json('outOfStock'))->toBe(0)
        ->and($response->json('inStockPercent'))->toEqual(100);
});

it('treats negative inventory quantities as zero', function () {
    inventoryProduct(['product_name' => 'Corrupt stock'], -5);

    Sanctum::actingAs(inventoryStatusAdmin());

    $response = $this->getJson('/api/admin/dashboard/inventory-status')->assertOk();

    expect($response->json('outOfStock'))->toBe(1)
        ->and($response->json('lowStock'))->toBe(0)
        ->and($response->json('inStock'))->toBe(0);
});

it('prefers stock-in records over disagreeing inventory quantities', function () {
    $product = inventoryProduct(['product_name' => 'Stock-in driven'], 5);
    StockIn::create([
        'product_id' => $product->product_id,
        'variant' => 'size',
        'stock_qty' => 50,
        'cost' => 100,
        'stock_in_date' => now(),
    ]);

    Sanctum::actingAs(inventoryStatusAdmin());

    $response = $this->getJson('/api/admin/dashboard/inventory-status')->assertOk();

    expect($response->json('inStock'))->toBe(1)
        ->and($response->json('lowStock'))->toBe(0)
        ->and($response->json('outOfStock'))->toBe(0);
});

it('sums stock-in rows per product when no inventory rows exist', function () {
    $product = inventoryProduct(['product_name' => 'Stock-in rows only']);
    StockIn::create([
        'product_id' => $product->product_id,
        'variant' => 'XS',
        'stock_qty' => 15,
        'cost' => 100,
        'stock_in_date' => now(),
    ]);
    StockIn::create([
        'product_id' => $product->product_id,
        'variant' => 'S',
        'stock_qty' => 10,
        'cost' => 100,
        'stock_in_date' => now(),
    ]);

    Sanctum::actingAs(inventoryStatusAdmin());

    $response = $this->getJson('/api/admin/dashboard/inventory-status')->assertOk();

    expect($response->json('inStock'))->toBe(1)
        ->and($response->json('lowStock'))->toBe(0)
        ->and($response->json('outOfStock'))->toBe(0)
        ->and($response->json('total'))->toBe(1);
});

it('returns zeros when there are no active products', function () {
    Sanctum::actingAs(inventoryStatusAdmin());

    $response = $this->getJson('/api/admin/dashboard/inventory-status')->assertOk();

    $response->assertJson([
        'inStock' => 0,
        'lowStock' => 0,
        'outOfStock' => 0,
        'total' => 0,
        'inStockPercent' => 0,
        'lowStockPercent' => 0,
        'outOfStockPercent' => 0,
    ]);
});

it('requires an admin user', function () {
    inventoryProduct(['product_name' => 'In stock'], 50);

    Sanctum::actingAs(User::create([
        'um_id' => 9100,
        'email' => 'customer@example.com',
        'user_fullname' => 'Regular Customer',
        'user_password' => 'secret-password',
        'role' => 'customer',
        'status' => 'active',
    ]));

    $this->getJson('/api/admin/dashboard/inventory-status')->assertForbidden();
});
