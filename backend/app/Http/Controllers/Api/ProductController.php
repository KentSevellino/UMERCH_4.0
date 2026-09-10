<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\InventoryLog;
use App\Models\OrderItems;
use App\Models\Products;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index()
    {
        $products = Products::all();
        return response()->json($products);
    }

    public function userProducts()
    {
        $products = Products::where('status', 'active')
            ->get()
            ->groupBy('product_name')
            ->map(function ($group) {
                $first = $group->first();
                $totalStock = $group->sum(fn ($p) => $p->inventory->sum('quantity') ?? $p->product_stock);
                return [
                    'product_id' => $first->product_id,
                    'product_name' => $first->product_name,
                    'product_image' => $first->product_image,
                    'product_description' => $first->product_description,
                    'product_price' => $first->product_price,
                    'product_stock' => $totalStock,
                    'variant' => $first->variant,
                    'variant_type' => $first->variant_type,
                    'status' => $first->status,
                    'inventory' => $group->flatMap(fn ($p) => $p->inventory),
                ];
            })
            ->values();

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_name' => 'required|string',
            'product_price' => 'required|numeric',
            'variant' => 'required|string',
            'variant_type' => 'nullable|string',
            'product_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'product_description' => 'nullable|string',
        ]);

        if ($request->hasFile('product_image')) {
            $validated['product_image'] = $request->file('product_image')->store('products', 'public');
        }

        $existing = Products::where('product_name', $validated['product_name'])
            ->where('variant', $validated['variant'])
            ->first();

        if ($existing) {
            return response()->json(['message' => 'A product with this name and variant already exists'], 409);
        }

        $product = Products::create($validated);

        Inventory::create([
            'product_id' => $product->product_id,
            'variant' => $validated['variant'],
            'quantity' => 0,
            'status' => 'active',
        ]);

        InventoryLog::create([
            'product_id' => $product->product_id,
            'item_name' => $validated['product_name'],
            'type' => 'Add Product',
            'quantity' => 0,
            'total' => 0,
            'admin_action' => Auth::user()->user_fullname ?? 'Admin',
        ]);

        return response()->json(['message' => 'Product created successfully', 'product' => $product], 201);
    }

    public function update(Request $request, $product_id)
    {
        $product = Products::where('product_id', $product_id)->first();
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $validated = $request->validate([
            'product_name' => 'sometimes|string',
            'product_price' => 'sometimes|numeric',
            'variant' => 'sometimes|string',
            'variant_type' => 'nullable|string',
            'product_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'product_description' => 'nullable|string',
        ]);

        if ($request->hasFile('product_image')) {
            $validated['product_image'] = $request->file('product_image')->store('products', 'public');
        }

        $product->update($validated);

        InventoryLog::create([
            'product_id' => $product->product_id,
            'item_name' => $product->product_name,
            'type' => 'Edit Product',
            'quantity' => 0,
            'total' => $product->product_stock,
            'admin_action' => Auth::user()->user_fullname ?? 'Admin',
        ]);

        return response()->json(['message' => 'Product updated successfully', 'product' => $product]);
    }

    public function destroy($product_id)
    {
        $product = Products::where('product_id', $product_id)->first();
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $pendingOrders = OrderItems::where('product_id', $product_id)
            ->whereHas('order', fn ($q) => $q->whereIn('status', ['Pending', 'Processing']))
            ->count();

        if ($pendingOrders > 0) {
            return response()->json(['message' => 'Cannot delete product with pending orders'], 409);
        }

        InventoryLog::create([
            'product_id' => $product->product_id,
            'item_name' => $product->product_name,
            'type' => 'Delete Product',
            'quantity' => 0,
            'total' => 0,
            'admin_action' => Auth::user()->user_fullname ?? 'Admin',
        ]);

        $product->delete();
        return response()->json(['message' => 'Product deleted successfully']);
    }

    public function archive($product_id)
    {
        $product = Products::where('product_id', $product_id)->first();
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $pendingOrders = OrderItems::where('product_id', $product_id)
            ->whereHas('order', fn ($q) => $q->whereIn('status', ['Pending', 'Processing']))
            ->count();

        if ($pendingOrders > 0) {
            return response()->json(['message' => 'Cannot archive product with pending orders'], 409);
        }

        $product->update(['status' => 'archived']);

        InventoryLog::create([
            'product_id' => $product->product_id,
            'item_name' => $product->product_name,
            'type' => 'Archived',
            'quantity' => 0,
            'total' => $product->product_stock,
            'admin_action' => Auth::user()->user_fullname ?? 'Admin',
        ]);

        return response()->json(['message' => 'Product archived successfully']);
    }

    public function restore($product_id)
    {
        $product = Products::where('product_id', $product_id)->first();
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $product->update(['status' => 'active']);

        InventoryLog::create([
            'product_id' => $product->product_id,
            'item_name' => $product->product_name,
            'type' => 'Restored',
            'quantity' => 0,
            'total' => $product->product_stock,
            'admin_action' => Auth::user()->user_fullname ?? 'Admin',
        ]);

        return response()->json(['message' => 'Product restored successfully']);
    }
}
