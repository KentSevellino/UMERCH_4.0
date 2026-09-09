<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Carts;
use App\Models\Carts_Item;
use App\Models\Inventory;
use App\Models\Products;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    public function addToCart(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'product_id' => 'required|exists:_products,product_id',
            'variant' => 'required|string',
            'quantity' => 'required|integer|min:1',
            'price' => 'required|numeric',
        ]);

        $userId = Auth::id();
        $productId = $request->product_id;
        $variant = trim($request->variant);
        $quantityRequested = $request->quantity;

        $inventoryItem = Inventory::where('product_id', $productId)
            ->where('variant', $variant)
            ->first();
        $availableStock = $inventoryItem ? $inventoryItem->quantity : 0;

        if ($availableStock === 0) {
            $product = Products::where('product_id', $productId)->first();
            $availableStock = $product ? $product->product_stock : 0;
        }

        if ($availableStock <= 0) {
            return response()->json(['message' => 'This product variant is out of stock', 'available_stock' => 0], 400);
        }

        if ($quantityRequested > $availableStock) {
            return response()->json([
                'message' => 'Insufficient stock available',
                'requested' => $quantityRequested,
                'available_stock' => $availableStock,
            ], 400);
        }

        $cart = Carts::firstOrCreate(['user_id' => $userId]);

        $existingItem = Carts_Item::where('cart_id', $cart->cart_id)
            ->where('product_id', $productId)
            ->where('variant', $variant)
            ->first();

        if ($existingItem) {
            $newQuantity = $existingItem->quantity + $quantityRequested;
            if ($newQuantity > $availableStock) {
                return response()->json([
                    'message' => 'Total quantity exceeds available stock',
                    'current_in_cart' => $existingItem->quantity,
                    'requested_additional' => $quantityRequested,
                    'total_requested' => $newQuantity,
                    'available_stock' => $availableStock,
                ], 400);
            }
            $existingItem->update(['quantity' => $newQuantity]);
            return response()->json(['message' => 'Item quantity updated in cart']);
        }

        Carts_Item::create([
            'cart_id' => $cart->cart_id,
            'product_id' => $productId,
            'variant' => $variant,
            'quantity' => $quantityRequested,
            'price' => $request->price,
        ]);

        return response()->json(['message' => 'Item added to cart successfully'], 201);
    }

    public function getCart()
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $cart = Carts::where('user_id', Auth::id())->first();
        if (!$cart) {
            return response()->json([]);
        }

        $cartItems = Carts_Item::where('cart_id', $cart->cart_id)->with('product')->get();
        return response()->json($cartItems);
    }

    public function removeFromCart($cartItemId)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        try {
            Carts_Item::destroy($cartItemId);
            return response()->json(['message' => 'Item removed successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error removing item'], 500);
        }
    }

    public function updateCartItem(Request $request, $cartItemId)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $request->validate(['variant' => 'required|string']);

        try {
            $cartItem = Carts_Item::findOrFail($cartItemId);
            $cartItem->update(['variant' => $request->variant]);
            return response()->json(['message' => 'Item updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error updating item'], 500);
        }
    }

    public function checkInventory(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'product_id' => 'required|integer',
            'variant' => 'required|string',
        ]);

        try {
            $inventory = Inventory::where('product_id', $request->product_id)
                ->where('variant', $request->variant)
                ->first();

            return response()->json(['quantity' => $inventory ? $inventory->quantity : 0]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error checking inventory'], 500);
        }
    }
}
