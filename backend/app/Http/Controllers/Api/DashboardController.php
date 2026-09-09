<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\OrderItems;
use App\Models\Orders;
use App\Models\Products;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getStats()
    {
        $today = Carbon::today();
        $todaySales = Orders::whereDate('created_at', $today)
            ->where('status', 'Completed')
            ->count();
        $todayEarnings = OrderItems::whereHas('order', fn ($q) => $q->whereDate('created_at', $today)->where('status', 'Completed'))
            ->sum('subtotal');
        $todayProducts = OrderItems::whereHas('order', fn ($q) => $q->whereDate('created_at', $today)->where('status', 'Completed'))
            ->sum('quantity');
        $activeProducts = Products::where('status', 'active')->count();
        $totalSalesAmount = OrderItems::whereHas('order', fn ($q) => $q->where('status', 'Completed'))->sum('subtotal');
        $totalUsers = User::where('role', '!=', 'Admin')->count();

        return response()->json([
            'todayEarnings' => $todayEarnings,
            'todayProducts' => $todayProducts,
            'activeProducts' => $activeProducts,
            'todaySales' => $todaySales,
            'todaySalesAmount' => $todaySales,
            'totalSalesAmount' => $totalSalesAmount,
            'totalUsers' => $totalUsers,
        ]);
    }

    public function getSalesOverview(Request $request)
    {
        $period = $request->get('period', 'daily');
        $now = Carbon::now();
        $data = [];

        if ($period === 'daily') {
            for ($i = 6; $i >= 0; $i--) {
                $date = $now->copy()->subDays($i);
                $sales = OrderItems::whereHas('order', function ($q) use ($date) {
                    $q->whereDate('created_at', $date)->where('status', 'Completed');
                })->sum('subtotal');
                $data[] = ['label' => $date->format('D'), 'value' => $sales];
            }
        } elseif ($period === 'weekly') {
            for ($i = 3; $i >= 0; $i--) {
                $start = $now->copy()->subWeeks($i)->startOfWeek();
                $end = $start->copy()->endOfWeek();
                $sales = OrderItems::whereHas('order', function ($q) use ($start, $end) {
                    $q->whereBetween('created_at', [$start, $end])->where('status', 'Completed');
                })->sum('subtotal');
                $data[] = ['label' => 'Week ' . (4 - $i), 'value' => $sales];
            }
        } else {
            for ($i = 5; $i >= 0; $i--) {
                $month = $now->copy()->subMonths($i);
                $sales = OrderItems::whereHas('order', function ($q) use ($month) {
                    $q->whereMonth('created_at', $month->month)
                      ->whereYear('created_at', $month->year)
                      ->where('status', 'Completed');
                })->sum('subtotal');
                $data[] = ['label' => $month->format('M'), 'value' => $sales];
            }
        }

        return response()->json($data);
    }

    public function getInventoryStatus()
    {
        $products = Products::where('status', 'active')->get();
        $lowStock = 0;
        $outOfStock = 0;
        $inStock = 0;

        foreach ($products as $product) {
            $stock = $product->inventory->sum('quantity') ?? $product->product_stock;
            if ($stock <= 0) {
                $outOfStock++;
            } elseif ($stock <= 10) {
                $lowStock++;
            } else {
                $inStock++;
            }
        }

        $total = $lowStock + $outOfStock + $inStock;
        return response()->json([
            'lowStock' => $lowStock,
            'outOfStock' => $outOfStock,
            'inStock' => $inStock,
            'total' => $total,
            'lowStockPercent' => $total > 0 ? round(($lowStock / $total) * 100, 1) : 0,
            'outOfStockPercent' => $total > 0 ? round(($outOfStock / $total) * 100, 1) : 0,
            'inStockPercent' => $total > 0 ? round(($inStock / $total) * 100, 1) : 0,
        ]);
    }

    public function getRecentTransactions()
    {
        $orders = Orders::with('user')
            ->where('status', '!=', 'Cancelled')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($order) {
                $total = $order->orderItems->sum('subtotal');
                return [
                    'id' => $order->order_id,
                    'customer' => $order->user?->user_fullname ?? 'Customer',
                    'status' => $order->status,
                    'orderId' => str_pad('#' . $order->order_id, 8, '0', STR_PAD_LEFT),
                    'amount' => $total,
                ];
            });

        return response()->json($orders);
    }

    public function getTopProducts(Request $request)
    {
        $period = $request->get('period', 'weekly');
        $startDate = $period === 'monthly' ? Carbon::now()->subMonth() : Carbon::now()->subWeek();

        $topProducts = OrderItems::whereHas('order', function ($q) use ($startDate) {
            $q->where('created_at', '>=', $startDate)->where('status', 'Completed');
        })
        ->select('product_id', DB::raw('SUM(quantity) as total_quantity'), DB::raw('SUM(subtotal) as total_sales'))
        ->groupBy('product_id')
        ->orderByDesc('total_sales')
        ->limit(5)
        ->get()
        ->map(function ($item, $index) {
            $product = Products::find($item->product_id);
            return [
                'rank' => $index + 1,
                'name' => $product->product_name ?? 'Unknown',
                'product_image' => $product->product_image ?? null,
                'category' => $product->variant_type ?? 'N/A',
                'quantity' => $item->total_quantity,
                'sales' => $item->total_sales,
            ];
        });

        return response()->json($topProducts);
    }

    public function getWeeklyStats()
    {
        $thisWeek = Carbon::now()->startOfWeek();
        $lastWeek = Carbon::now()->subWeek()->startOfWeek();

        $thisWeekRevenue = OrderItems::whereHas('order', function ($q) use ($thisWeek) {
            $q->where('created_at', '>=', $thisWeek)->where('status', 'Completed');
        })->sum('subtotal');

        $lastWeekRevenue = OrderItems::whereHas('order', function ($q) use ($lastWeek, $thisWeek) {
            $q->where('created_at', '>=', $lastWeek)->where('created_at', '<', $thisWeek)->where('status', 'Completed');
        })->sum('subtotal');

        $thisWeekOrders = Orders::where('created_at', '>=', $thisWeek)->count();
        $lastWeekOrders = Orders::where('created_at', '>=', $lastWeek)->where('created_at', '<', $thisWeek)->count();

        $thisWeekSales = OrderItems::whereHas('order', function ($q) use ($thisWeek) {
            $q->where('created_at', '>=', $thisWeek)->where('status', 'Completed');
        })->sum('quantity');

        $lastWeekSales = OrderItems::whereHas('order', function ($q) use ($lastWeek, $thisWeek) {
            $q->where('created_at', '>=', $lastWeek)->where('created_at', '<', $thisWeek)->where('status', 'Completed');
        })->sum('quantity');

        $revenueChange = $lastWeekRevenue > 0 ? round((($thisWeekRevenue - $lastWeekRevenue) / $lastWeekRevenue) * 100, 1) : 0;
        $ordersChange = $lastWeekOrders > 0 ? round((($thisWeekOrders - $lastWeekOrders) / $lastWeekOrders) * 100, 1) : 0;
        $salesChange = $lastWeekSales > 0 ? round((($thisWeekSales - $lastWeekSales) / $lastWeekSales) * 100, 1) : 0;

        return response()->json([
            'revenue' => $thisWeekRevenue,
            'revenueChange' => $revenueChange,
            'orders' => $thisWeekOrders,
            'ordersChange' => $ordersChange,
            'sales' => $thisWeekSales,
            'salesChange' => $salesChange,
        ]);
    }
}
