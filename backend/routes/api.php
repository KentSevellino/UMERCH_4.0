<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\StockInController;
use App\Http\Controllers\Api\StockOutController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\InventoryReportController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\InventoryLogController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);
Route::post('/check-trusted-device', [AuthController::class, 'checkTrustedDevice']);

// Public product listing
Route::get('/products', [ProductController::class, 'userProducts']);

// Public inventory API
Route::get('/inventory', [\App\Http\Controllers\Api\InventoryApiController::class, 'index']);
Route::get('/inventory/{productId}', [\App\Http\Controllers\Api\InventoryApiController::class, 'getByProduct']);

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
    Route::get('/trusted-devices', [AuthController::class, 'getTrustedDevices']);
    Route::delete('/trusted-devices/{deviceId}', [AuthController::class, 'forgetDevice']);

    // Cart
    Route::post('/cart/add', [CartController::class, 'addToCart']);
    Route::get('/cart', [CartController::class, 'getCart']);
    Route::delete('/cart/{cartItemId}', [CartController::class, 'removeFromCart']);
    Route::put('/cart/{cartItemId}', [CartController::class, 'updateCartItem']);
    Route::get('/check-inventory', [CartController::class, 'checkInventory']);

    // Orders
    Route::post('/orders/place', [OrderController::class, 'placeOrder']);
    Route::get('/orders', [OrderController::class, 'getUserOrders']);
    Route::post('/orders/{orderId}/upload-receipt', [OrderController::class, 'uploadReceipt']);
    Route::post('/orders/{orderId}/buy-again', [OrderController::class, 'buyAgain']);

    /*
    |--------------------------------------------------------------------------
    | Admin Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('is_admin')->prefix('admin')->group(function () {

        // Dashboard
        Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
        Route::get('/dashboard/sales-overview', [DashboardController::class, 'getSalesOverview']);
        Route::get('/dashboard/inventory-status', [DashboardController::class, 'getInventoryStatus']);
        Route::get('/dashboard/recent-transactions', [DashboardController::class, 'getRecentTransactions']);
        Route::get('/dashboard/top-products', [DashboardController::class, 'getTopProducts']);
        Route::get('/dashboard/weekly-stats', [DashboardController::class, 'getWeeklyStats']);

        // Users
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::patch('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
        Route::patch('/users/{id}/deactivate', [UserController::class, 'deactivate']);
        Route::patch('/users/{id}/reactivate', [UserController::class, 'reactivate']);

        // Products
        Route::get('/products', [ProductController::class, 'index']);
        Route::post('/products', [ProductController::class, 'store']);
        Route::patch('/products/{product_id}', [ProductController::class, 'update']);
        Route::delete('/products/{product_id}', [ProductController::class, 'destroy']);
        Route::patch('/products/{product_id}/archive', [ProductController::class, 'archive']);
        Route::patch('/products/{product_id}/restore', [ProductController::class, 'restore']);

        // Stock In
        Route::get('/stock-in', [StockInController::class, 'index']);
        Route::post('/stock-in', [StockInController::class, 'store']);
        Route::patch('/stock-in/{id}', [StockInController::class, 'update']);
        Route::delete('/stock-in/{id}', [StockInController::class, 'destroy']);

        // Stock Out
        Route::get('/stock-out', [StockOutController::class, 'logs']);
        Route::post('/stock-out', [StockOutController::class, 'store']);

        // Inventory Report
        Route::get('/inventory-report', [InventoryReportController::class, 'getReport']);
        Route::get('/inventory-report/export-csv', [InventoryReportController::class, 'exportCSV']);

        // Orders (Admin)
        Route::get('/orders', [OrderController::class, 'getAllOrders']);
        Route::put('/orders/{orderId}/status', [OrderController::class, 'updateOrderStatus']);

        // Logs
        Route::get('/inventory-logs', [InventoryLogController::class, 'getLogs']);
        Route::get('/activity-logs', [ActivityLogController::class, 'getLogs']);
        Route::get('/activity-logs/stats', [ActivityLogController::class, 'getStats']);
    });
});
