<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryLog;
use Illuminate\Http\Request;

class InventoryLogController extends Controller
{
    public function getLogs(Request $request)
    {
        $query = InventoryLog::with('product')->orderBy('created_at', 'desc');

        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('item_name', 'like', "%{$search}%")
                  ->orWhere('admin_action', 'like', "%{$search}%");
            });
        }

        $perPage = $request->get('per_page', 10);
        $logs = $query->paginate($perPage);

        return response()->json($logs);
    }
}
