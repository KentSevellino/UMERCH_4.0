<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\InventoryLog;
use App\Models\Products;
use App\Models\StockIn;
use App\Models\StockOut;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StockOutController extends Controller
{
    public function logs()
    {
        $stockOuts = StockOut::join('_products', 'stock_outs.product_id', '=', '_products.product_id')
            ->select('stock_outs.*', '_products.product_name', '_products.variant')
            ->orderBy('stock_outs.created_at', 'desc')
            ->get();

        return response()->json($stockOuts);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:_products,product_id',
            'variant' => 'required|string',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string',
        ]);

        $inventory = Inventory::where('product_id', $validated['product_id'])
            ->where('variant', $validated['variant'])
            ->first();

        if (!$inventory || $inventory->quantity < $validated['quantity']) {
            return response()->json(['message' => 'Insufficient stock'], 400);
        }

        $modifiedBy = Auth::user()->user_fullname ?? 'Admin';

        Inventory::where('product_id', $validated['product_id'])
            ->where('variant', $validated['variant'])
            ->decrement('quantity', $validated['quantity']);

        StockIn::where('product_id', $validated['product_id'])
            ->where('variant', $validated['variant'])
            ->decrement('stock_qty', $validated['quantity']);

        Products::where('product_id', $validated['product_id'])
            ->decrement('product_stock', $validated['quantity']);

        StockOut::create([
            'product_id' => $validated['product_id'],
            'quantity' => $validated['quantity'],
            'modified_by' => $modifiedBy,
            'reason' => $validated['reason'],
            'date_time' => now(),
        ]);

        $product = Products::find($validated['product_id']);
        InventoryLog::create([
            'product_id' => $validated['product_id'],
            'item_name' => $product->product_name ?? 'Unknown',
            'type' => 'Stock Out',
            'quantity' => -$validated['quantity'],
            'total' => $product->product_stock ?? 0,
            'admin_action' => $modifiedBy,
        ]);

        return response()->json(['message' => 'Stock out recorded successfully'], 201);
    }
}
