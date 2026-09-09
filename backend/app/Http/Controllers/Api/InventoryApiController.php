<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;

class InventoryApiController extends Controller
{
    public function index()
    {
        $inventory = Inventory::all();
        return response()->json($inventory);
    }

    public function getByProduct($productId)
    {
        $inventory = Inventory::where('product_id', $productId)->get();
        return response()->json($inventory);
    }
}
