<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Carts;
use App\Models\Carts_Item;
use App\Models\Inventory;
use App\Models\OrderItems;
use App\Models\Orders;
use App\Models\Products;
use App\Models\StockIn;
use App\Models\StockOut;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class OrderController extends Controller
{
    public function placeOrder(Request $request)
    {
        $validated = $request->validate([
            'payment_method' => 'required|string',
            'fulfillment_method' => 'required|string',
            'campus' => 'nullable|string',
            'cart_items' => 'required|array',
        ]);

        try {
            $userId = Auth::id();

            if (empty($validated['cart_items'])) {
                return response()->json(['message' => 'No items to order'], 400);
            }

            foreach ($validated['cart_items'] as $cartItem) {
                $inventoryItem = Inventory::where('product_id', $cartItem['product_id'])
                    ->where('variant', $cartItem['variant'] ?? '')
                    ->first();
                $availableStock = $inventoryItem ? $inventoryItem->quantity : 0;

                if ($availableStock <= 0) {
                    $product = Products::where('product_id', $cartItem['product_id'])->first();
                    $availableStock = $product ? $product->product_stock : 0;
                }

                if ($availableStock < intval($cartItem['quantity'])) {
                    return response()->json([
                        'message' => 'Insufficient stock for product',
                        'product_id' => $cartItem['product_id'],
                        'requested' => intval($cartItem['quantity']),
                        'available' => $availableStock,
                    ], 400);
                }
            }

            $order = Orders::create([
                'user_id' => $userId,
                'status' => 'Pending',
                'payment_method' => $validated['payment_method'],
                'fulfillment_method' => $validated['fulfillment_method'],
                'campus' => $validated['campus'],
                'order_date' => now(),
            ]);

            foreach ($validated['cart_items'] as $cartItem) {
                $subtotal = floatval($cartItem['price']) * intval($cartItem['quantity']);
                OrderItems::create([
                    'order_id' => $order->order_id,
                    'product_id' => $cartItem['product_id'],
                    'quantity' => $cartItem['quantity'],
                    'price' => $cartItem['price'],
                    'variant' => $cartItem['variant'],
                    'subtotal' => $subtotal,
                ]);
            }

            $cart = Carts::where('user_id', $userId)->first();
            if ($cart) {
                foreach ($validated['cart_items'] as $ci) {
                    if (isset($ci['cart_item_id'])) {
                        Carts_Item::where('cart_item_id', $ci['cart_item_id'])->delete();
                    } else {
                        Carts_Item::where('cart_id', $cart->cart_id)
                            ->where('product_id', $ci['product_id'])
                            ->where('variant', $ci['variant'] ?? '')
                            ->delete();
                    }
                }
            }

            return response()->json([
                'message' => 'Order placed successfully',
                'orderId' => $order->order_id,
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error placing order', 'error' => $e->getMessage()], 500);
        }
    }

    public function getUserOrders()
    {
        try {
            $orders = Orders::where('user_id', Auth::id())
                ->with('orderItems.product')
                ->orderBy('created_at', 'desc')
                ->get();

            $formattedOrders = $orders->map(function ($order) {
                $orderTotal = $order->orderItems->sum('subtotal');
                return [
                    'order_id' => $order->order_id,
                    'order_status' => $order->status,
                    'order_total' => $orderTotal,
                    'fulfillment_method' => $order->fulfillment_method ?? 'N/A',
                    'campus' => $order->campus,
                    'receipt_form' => $order->receipt_form,
                    'created_at' => $order->created_at,
                    'order_items' => $order->orderItems->map(fn ($item) => [
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                        'variant' => $item->variant ?? 'N/A',
                        'subtotal' => $item->subtotal,
                        'product' => $item->product ? [
                            'product_id' => $item->product->product_id,
                            'product_name' => $item->product->product_name,
                            'product_image' => $item->product->product_image,
                            'product_description' => $item->product->product_description,
                        ] : null,
                    ])->toArray(),
                ];
            });

            return response()->json($formattedOrders);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching orders', 'error' => $e->getMessage()], 500);
        }
    }

    public function getAllOrders()
    {
        try {
            $orders = Orders::with(['orderItems.product', 'user'])
                ->orderBy('created_at', 'desc')
                ->get();

            $formattedOrders = $orders->map(function ($order) {
                $orderTotal = $order->orderItems->sum('subtotal');
                return [
                    'order_id' => $order->order_id,
                    'order_status' => $order->status,
                    'order_total' => $orderTotal,
                    'receipt_form' => $order->receipt_form,
                    'campus' => $order->campus,
                    'created_at' => $order->created_at,
                    'user_id' => $order->user_id,
                    'user_fullname' => $order->user?->user_fullname ?? 'Customer',
                    'order_items' => $order->orderItems->map(fn ($item) => [
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                        'variant' => $item->variant ?? 'N/A',
                        'subtotal' => $item->subtotal,
                        'product' => $item->product ? [
                            'product_id' => $item->product->product_id,
                            'product_name' => $item->product->product_name,
                            'product_image' => $item->product->product_image,
                        ] : null,
                    ])->toArray(),
                ];
            });

            return response()->json($formattedOrders);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching orders', 'error' => $e->getMessage()], 500);
        }
    }

    public function uploadReceipt($orderId, Request $request)
    {
        try {
            $userId = Auth::id();
            $order = Orders::where('order_id', $orderId)->where('user_id', $userId)->first();

            if (!$order) {
                return response()->json(['message' => 'Order not found'], 404);
            }

            if (!$request->hasFile('receipt_form')) {
                return response()->json(['message' => 'No file provided'], 400);
            }

            $file = $request->file('receipt_form');
            $allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (!in_array($file->getMimeType(), $allowedMimes)) {
                return response()->json(['message' => 'Invalid file type. Only JPG, PNG, and PDF are allowed'], 400);
            }

            $fileName = 'receipt_' . $orderId . '_' . time() . '.' . $file->getClientOriginalExtension();
            $filePath = $file->storeAs('receipts', $fileName, 'public');

            $updateData = ['receipt_form' => $filePath];
            if (strtolower($order->status) === 'cancelled') {
                $updateData['status'] = 'Pending';
            }

            $order->update($updateData);
            $order->refresh();

            return response()->json([
                'message' => 'Receipt uploaded successfully',
                'file_path' => $filePath,
                'new_status' => $order->status,
                'receipt_form' => $order->receipt_form,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error uploading receipt', 'error' => $e->getMessage()], 500);
        }
    }

    public function updateOrderStatus($orderId, Request $request)
    {
        try {
            $order = Orders::where('order_id', $orderId)->first();
            if (!$order) {
                return response()->json(['message' => 'Order not found'], 404);
            }

            $newStatus = $request->input('status');
            $modifiedByUser = 'System';
            if (Auth::check()) {
                $user = Auth::user();
                if ($user && isset($user->user_fullname)) {
                    $modifiedByUser = $user->user_fullname;
                }
            }

            if (strtolower($newStatus) === 'completed' && strtolower($order->status) !== 'completed') {
                DB::transaction(function () use ($order, $modifiedByUser) {
                    $orderItems = OrderItems::where('order_id', $order->order_id)->get();
                    foreach ($orderItems as $item) {
                        StockOut::create([
                            'product_id' => $item->product_id,
                            'order_id' => $order->order_id,
                            'quantity' => $item->quantity,
                            'modified_by' => $modifiedByUser,
                            'reason' => 'order',
                            'date_time' => now(),
                        ]);
                        Products::where('product_id', $item->product_id)->decrement('product_stock', $item->quantity);
                        Inventory::where('product_id', $item->product_id)->decrement('quantity', $item->quantity);
                        StockIn::where('product_id', $item->product_id)->decrement('stock_qty', $item->quantity);
                    }
                });
            }

            $order->status = $newStatus;
            $order->save();

            return response()->json([
                'message' => 'Order status updated successfully',
                'order' => ['order_id' => $order->order_id, 'status' => $order->status, 'campus' => $order->campus],
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error updating order status', 'error' => $e->getMessage()], 500);
        }
    }

    public function buyAgain($orderId)
    {
        try {
            $userId = Auth::id();
            $order = Orders::where('order_id', $orderId)->where('user_id', $userId)->first();

            if (!$order) {
                return response()->json(['message' => 'Order not found'], 404);
            }

            $orderItems = OrderItems::where('order_id', $orderId)->get();
            if ($orderItems->isEmpty()) {
                return response()->json(['message' => 'No items in order'], 400);
            }

            $cart = Carts::firstOrCreate(['user_id' => $userId]);
            $successCount = 0;
            $failedItems = [];

            foreach ($orderItems as $item) {
                $inventoryItem = Inventory::where('product_id', $item->product_id)
                    ->where('variant', $item->variant)->first();
                $availableStock = $inventoryItem ? $inventoryItem->quantity : 0;

                if ($availableStock === 0) {
                    $product = Products::where('product_id', $item->product_id)->first();
                    $availableStock = $product ? $product->product_stock : 0;
                }

                if ($availableStock <= 0) {
                    $failedItems[] = ['product_id' => $item->product_id, 'reason' => 'Out of Stock'];
                    continue;
                }

                if ($item->quantity > $availableStock) {
                    $failedItems[] = ['product_id' => $item->product_id, 'reason' => 'Insufficient Stock', 'available' => $availableStock];
                    continue;
                }

                $existingItem = Carts_Item::where('cart_id', $cart->cart_id)
                    ->where('product_id', $item->product_id)
                    ->where('variant', $item->variant)->first();

                if ($existingItem) {
                    $newQuantity = $existingItem->quantity + $item->quantity;
                    if ($newQuantity > $availableStock) {
                        $failedItems[] = ['product_id' => $item->product_id, 'reason' => 'Total quantity exceeds stock'];
                        continue;
                    }
                    $existingItem->update(['quantity' => $newQuantity]);
                } else {
                    Carts_Item::create([
                        'cart_id' => $cart->cart_id,
                        'product_id' => $item->product_id,
                        'variant' => $item->variant,
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                    ]);
                }
                $successCount++;
            }

            return response()->json([
                'message' => $successCount . ' items added to cart. ' . count($failedItems) . ' items unavailable.',
                'success_count' => $successCount,
                'failed_items' => $failedItems,
                'total_items' => $orderItems->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error processing buy again request', 'error' => $e->getMessage()], 500);
        }
    }
}
