<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\InventoryApiController;
use App\Http\Controllers\Api\InventoryLogController;
use App\Http\Controllers\Api\InventoryReportController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\StockInController;
use App\Http\Controllers\Api\StockOutController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/health-check', function () {
    try {
        $db = \Illuminate\Support\Facades\DB::connection()->getDatabaseName();
        $tables = \Illuminate\Support\Facades\DB::select('SHOW TABLES');
        $mailTest = null;
        try {
            \Illuminate\Support\Facades\Mail::raw('Test OTP verification email', function ($m) {
                $m->to('kentsevellino11@gmail.com')->subject('UMerch Test');
            });
            $mailTest = 'sent';
        } catch (\Throwable $me) {
            $mailTest = $me->getMessage();
        }
        return response()->json([
            'status' => 'ok',
            'database' => $db,
            'tables' => $tables,
            'user_count' => \Illuminate\Support\Facades\DB::table('users')->count(),
            'mail_mailer' => config('mail.default'),
            'mail_host' => config('mail.mailers.smtp.host'),
            'mail_port' => config('mail.mailers.smtp.port'),
            'mail_scheme' => config('mail.mailers.smtp.scheme'),
            'mail_from' => config('mail.from.address'),
            'mail_username' => config('mail.mailers.smtp.username') ? 'set' : 'not_set',
            'mail_password' => config('mail.mailers.smtp.password') ? 'set' : 'not_set',
            'mail_test' => $mailTest,
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ], 500);
    }
});

Route::post('/login', [AuthController::class, 'login']);
Route::post('/check-trusted-device', [AuthController::class, 'checkTrustedDevice']);

// Google OAuth
Route::get('/auth/google', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);
Route::post('/google-login', [AuthController::class, 'googleLogin']);
Route::post('/auth/exchange', [AuthController::class, 'exchangeGoogleCode']);

// Public product listing
Route::get('/products', [ProductController::class, 'userProducts']);
Route::get('/products/{productId}', [ProductController::class, 'show']);

// Public inventory API
Route::get('/inventory', [InventoryApiController::class, 'index']);
Route::get('/inventory/{productId}', [InventoryApiController::class, 'getByProduct']);

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Auth (no OTP required)
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/resend-otp', [AuthController::class, 'resendOtp']);

    // User routes (OTP required)
    Route::middleware('otp_verified')->group(function () {
        Route::get('/profile', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::patch('/profile', [AuthController::class, 'updateProfile']);
        Route::get('/trusted-devices', [AuthController::class, 'getTrustedDevices']);
        Route::delete('/trusted-devices/{deviceId}', [AuthController::class, 'forgetDevice']);

        // Cart
        Route::post('/cart', [CartController::class, 'addToCart']);
        Route::post('/cart/add', [CartController::class, 'addToCart']);
        Route::get('/cart', [CartController::class, 'getCart']);
        Route::delete('/cart/{cartItemId}', [CartController::class, 'removeFromCart']);
        Route::put('/cart/{cartItemId}', [CartController::class, 'updateCartItem']);
        Route::get('/check-inventory', [CartController::class, 'checkInventory']);

        // Orders
        Route::post('/orders', [OrderController::class, 'placeOrder']);
        Route::post('/orders/place', [OrderController::class, 'placeOrder']);
        Route::get('/orders', [OrderController::class, 'getUserOrders']);
        Route::post('/orders/{orderId}/upload-receipt', [OrderController::class, 'uploadReceipt']);
        Route::post('/orders/{orderId}/buy-again', [OrderController::class, 'buyAgain']);
        Route::patch('/orders/{orderId}/receive', [OrderController::class, 'markAsReceived']);

    });

    /*
    |--------------------------------------------------------------------------
    | Admin Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware(['is_admin', 'otp_verified'])->prefix('admin')->group(function () {

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
