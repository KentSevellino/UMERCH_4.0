<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\OrderItems;
use App\Models\Products;
use App\Models\StockIn;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class InventoryReportController extends Controller
{
    public function getReport(Request $request)
    {
        $filterType = $request->get('filterType', 'day');
        $filterDate = $request->get('filterDate', now()->format('Y-m-d'));

        try {
            $startDate = Carbon::parse($filterDate);
            match ($filterType) {
                'day' => $startDate->startOfDay(),
                'week' => $startDate->startOfWeek(),
                'month' => $startDate->startOfMonth(),
                default => $startDate->startOfDay(),
            };
            $endDate = match ($filterType) {
                'day' => $startDate->copy()->endOfDay(),
                'week' => $startDate->copy()->endOfWeek(),
                'month' => $startDate->copy()->endOfMonth(),
                default => $startDate->copy()->endOfDay(),
            };
        } catch (\Exception $e) {
            $startDate = Carbon::now()->startOfDay();
            $endDate = Carbon::now()->endOfDay();
        }

        $products = Products::where('status', 'active')->get();
        $report = [];

        foreach ($products as $product) {
            $soldQty = OrderItems::where('product_id', $product->product_id)
                ->whereHas('order', function ($q) use ($startDate, $endDate) {
                    $q->whereBetween('created_at', [$startDate, $endDate])->where('status', 'Completed');
                })->sum('quantity');

            $soldValue = OrderItems::where('product_id', $product->product_id)
                ->whereHas('order', function ($q) use ($startDate, $endDate) {
                    $q->whereBetween('created_at', [$startDate, $endDate])->where('status', 'Completed');
                })->sum('subtotal');

            $purchasedQty = StockIn::where('product_id', $product->product_id)
                ->whereBetween('stock_in_date', [$startDate, $endDate])
                ->sum('stock_qty');

            $purchasedValue = StockIn::where('product_id', $product->product_id)
                ->whereBetween('stock_in_date', [$startDate, $endDate])
                ->sum(DB::raw('stock_qty * cost'));

            $inventory = Inventory::where('product_id', $product->product_id)->first();
            $currentStock = $inventory ? $inventory->quantity : $product->product_stock;

            $report[] = [
                'product_id' => $product->product_id,
                'product_name' => $product->product_name,
                'variant_type' => $product->variant_type ?? 'N/A',
                'status' => $product->status,
                'unit_price' => $product->product_price,
                'sold_qty' => $soldQty,
                'sold_value' => $soldValue,
                'purchased_qty' => $purchasedQty,
                'purchased_value' => $purchasedValue,
                'stock_decrease' => $purchasedQty - $soldQty,
                'current_stock' => $currentStock,
                'date_range' => [$startDate->toDateString(), $endDate->toDateString()],
            ];
        }

        $totals = [
            'total_sold_qty' => collect($report)->sum('sold_qty'),
            'total_purchased_qty' => collect($report)->sum('purchased_qty'),
            'total_purchased_value' => collect($report)->sum('purchased_value'),
            'total_sold_value' => collect($report)->sum('sold_value'),
        ];

        return response()->json(['report' => $report, 'totals' => $totals]);
    }

    public function exportCSV(Request $request)
    {
        $result = $this->getReport($request)->getData(true);
        $report = $result['report'];

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="inventory_report.csv"',
        ];

        $callback = function () use ($report) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Product ID', 'Product Name', 'Variant Type', 'Status', 'Unit Price', 'Sold Qty', 'Sold Value', 'Purchased Qty', 'Purchased Value', 'Stock Decrease', 'Current Stock']);
            foreach ($report as $row) {
                fputcsv($file, [
                    $row['product_id'], $row['product_name'], $row['variant_type'], $row['status'],
                    $row['unit_price'], $row['sold_qty'], $row['sold_value'],
                    $row['purchased_qty'], $row['purchased_value'], $row['stock_decrease'], $row['current_stock'],
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
