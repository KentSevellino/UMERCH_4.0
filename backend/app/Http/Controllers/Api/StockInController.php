<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\InventoryLog;
use App\Models\Products;
use App\Models\StockIn;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class StockInController extends Controller
{
    public function index()
    {
        $stockIns = StockIn::join('_products', 'stock_ins.product_id', '=', '_products.product_id')
            ->select('stock_ins.*', '_products.product_name', '_products.product_image')
            ->orderBy('stock_ins.created_at', 'desc')
            ->get();

        return response()->json($stockIns);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:_products,product_id',
            'variant' => 'required|string',
            'stock_qty' => 'required|integer|min:1',
            'cost' => 'required|numeric|min:0',
            'stock_in_date' => 'required|date',
        ]);

        return DB::transaction(function () use ($validated) {
            $inventory = Inventory::where('product_id', $validated['product_id'])
                ->where('variant', $validated['variant'])
                ->lockForUpdate()
                ->first();

            if ($inventory) {
                $inventory->increment('quantity', $validated['stock_qty']);
            } else {
                Inventory::create([
                    'product_id' => $validated['product_id'],
                    'variant' => $validated['variant'],
                    'quantity' => $validated['stock_qty'],
                    'status' => 'active',
                    'cost' => $validated['cost'],
                ]);
            }

            $existingStockIn = StockIn::where('product_id', $validated['product_id'])
                ->where('variant', $validated['variant'])
                ->first();

            if ($existingStockIn) {
                $existingStockIn->increment('stock_qty', $validated['stock_qty']);
                $existingStockIn->update(['cost' => $validated['cost'], 'stock_in_date' => $validated['stock_in_date']]);
            } else {
                StockIn::create($validated);
            }

            Products::where('product_id', $validated['product_id'])
                ->increment('product_stock', $validated['stock_qty']);

            $product = Products::find($validated['product_id']);
            InventoryLog::create([
                'product_id' => $validated['product_id'],
                'item_name' => $product->product_name ?? 'Unknown',
                'type' => 'Stock In',
                'quantity' => $validated['stock_qty'],
                'total' => $product->product_stock ?? 0,
                'admin_action' => Auth::user()->user_fullname ?? 'Admin',
            ]);

            return response()->json(['message' => 'Stock added successfully'], 201);
        });
    }

    public function update(Request $request, $id)
    {
        $stockIn = StockIn::where('stock_in_id', $id)->first();
        if (!$stockIn) {
            return response()->json(['message' => 'Stock-in record not found'], 404);
        }

        $validated = $request->validate([
            'stock_qty' => 'required|integer|min:1',
            'cost' => 'required|numeric|min:0',
            'stock_in_date' => 'required|date',
        ]);

        $delta = $validated['stock_qty'] - $stockIn->stock_qty;

        return DB::transaction(function () use ($stockIn, $validated, $delta) {
            Products::where('product_id', $stockIn->product_id)->increment('product_stock', $delta);
            Inventory::where('product_id', $stockIn->product_id)
                ->where('variant', $stockIn->variant)
                ->increment('quantity', $delta);

            $stockIn->update($validated);

            return response()->json(['message' => 'Stock-in updated successfully']);
        });
    }

    public function destroy($id)
    {
        $stockIn = StockIn::where('stock_in_id', $id)->first();
        if (!$stockIn) {
            return response()->json(['message' => 'Stock-in record not found'], 404);
        }

        return DB::transaction(function () use ($stockIn) {
            Products::where('product_id', $stockIn->product_id)->decrement('product_stock', $stockIn->stock_qty);
            Inventory::where('product_id', $stockIn->product_id)
                ->where('variant', $stockIn->variant)
                ->decrement('quantity', $stockIn->stock_qty);

            $stockIn->delete();

            return response()->json(['message' => 'Stock-in deleted successfully']);
        });
    }
}
