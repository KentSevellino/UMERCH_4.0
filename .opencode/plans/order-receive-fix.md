# Fix: "Failed to mark order as received" Error

## Problem
The "Order Received" button in ToReceivePage calls `PUT /admin/orders/{orderId}/status` which is protected by `is_admin` middleware. Regular users get 403.

## Solution
Add a user-side route that verifies order ownership.

---

## Change 1: `backend/routes/api.php`
Add new route inside the `otp_verified` group (after line 59):

```php
Route::patch('/orders/{orderId}/receive', [OrderController::class, 'markAsReceived']);
```

---

## Change 2: `backend/app/Http/Controllers/Api/OrderController.php`
Add this new method after the `buyAgain` method (after line 352):

```php
public function markAsReceived($orderId)
{
    try {
        $userId = Auth::id();
        $order = Orders::where('order_id', $orderId)->where('user_id', $userId)->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        if (strtolower($order->status) !== 'ready-for-pickup') {
            return response()->json(['message' => 'Order is not ready for pickup'], 400);
        }

        DB::transaction(function () use ($order) {
            $orderItems = OrderItems::where('order_id', $order->order_id)->get();
            foreach ($orderItems as $item) {
                StockOut::create([
                    'product_id' => $item->product_id,
                    'order_id' => $order->order_id,
                    'variant' => $item->variant,
                    'quantity' => $item->quantity,
                    'modified_by' => 'System',
                    'reason' => 'order',
                    'date_time' => now(),
                ]);
                Products::where('product_id', $item->product_id)->decrement('product_stock', $item->quantity);
                Inventory::where('product_id', $item->product_id)->decrement('quantity', $item->quantity);
                StockIn::where('product_id', $item->product_id)->decrement('stock_qty', $item->quantity);

                $product = Products::find($item->product_id);
                InventoryLog::create([
                    'product_id' => $item->product_id,
                    'item_name' => $product->product_name ?? 'Unknown',
                    'type' => 'Stock Out',
                    'quantity' => -$item->quantity,
                    'total' => $product->product_stock ?? 0,
                    'admin_action' => 'System',
                ]);
            }
        });

        $order->status = 'Completed';
        $order->save();

        return response()->json([
            'message' => 'Order marked as received successfully',
            'order' => ['order_id' => $order->order_id, 'status' => $order->status],
        ]);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Error updating order status', 'error' => $e->getMessage()], 500);
    }
}
```

---

## Change 3: `frontend/src/Pages/ToReceivePage.tsx`
Change line 108 from:
```js
await api.put(`/admin/orders/${orderId}/status`, {
    status: 'Completed'
});
```
to:
```js
await api.patch(`/orders/${orderId}/receive`);
```
