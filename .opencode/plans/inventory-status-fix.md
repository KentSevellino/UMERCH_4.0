# Fix: Inventory Status Chart Shows 0%

## Problem
`getInventoryStatus()` in `DashboardController.php` uses `$product->inventory->sum('quantity') || $product->product_stock` which:
1. Triggers N+1 lazy-load queries (no eager loading) — can timeout with many products
2. `||` returns first truthy value — if inventory sum is 0 (falsy), falls back to product_stock; data inconsistency between the two sources can produce false zeros
3. `inStockPercent` is calculated by subtracting two rounded percentages from 100, causing rounding errors

## Fix
Replace the `getInventoryStatus` method in `backend/app/Http/Controllers/Api/DashboardController.php` (lines 82-110):

```php
public function getInventoryStatus()
{
    $products = Products::where('status', 'active')->with('inventory')->get();
    $lowStock = 0;
    $outOfStock = 0;
    $inStock = 0;

    foreach ($products as $product) {
        $stock = max((int) $product->inventory->sum('quantity'), (int) ($product->product_stock ?? 0));
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
```
