import { Link } from 'react-router-dom';

const CIRCUMFERENCE = 2 * Math.PI * 40;
const arc = (percent: number) => (percent / 100) * CIRCUMFERENCE;

interface InventoryStatusData {
  lowStock: number;
  outOfStock: number;
  inStock: number;
  lowStockPercent: number;
  outOfStockPercent: number;
  inStockPercent: number;
}

interface InventoryStatusProps {
  inventoryStatus?: InventoryStatusData;
}

export default function InventoryStatus({ inventoryStatus }: InventoryStatusProps) {
  const {
    lowStock = 0,
    outOfStock = 0,
    inStock = 0,
    lowStockPercent = 0,
    outOfStockPercent = 0,
    inStockPercent = 0,
  } = inventoryStatus || {};

  return (
    <div className="w-[280px] bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Inventory Status</h3>
        <Link to="/admin/inventory/stock-in" className="text-sm text-gray-500">View All</Link>
      </div>

      <div className="flex justify-center mb-6">
        <div className="relative w-40 h-40">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="12" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#EAB308" strokeWidth="12" strokeDasharray={`${arc(lowStockPercent)} ${CIRCUMFERENCE}`} strokeDashoffset="0" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#DC2626" strokeWidth="12" strokeDasharray={`${arc(outOfStockPercent)} ${CIRCUMFERENCE}`} strokeDashoffset={-arc(lowStockPercent)} />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#22C55E" strokeWidth="12" strokeDasharray={`${arc(inStockPercent)} ${CIRCUMFERENCE}`} strokeDashoffset={-arc(lowStockPercent + outOfStockPercent)} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{inStockPercent}%</span>
            <span className="text-xs text-gray-500">In Stock</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-sm">Low Stock</span>
          </div>
          <span className="text-sm font-semibold">{lowStock} Products · {lowStockPercent}%</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-sm">Out of Stock</span>
          </div>
          <span className="text-sm font-semibold">{outOfStock} Products · {outOfStockPercent}%</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-sm">In Stock</span>
          </div>
          <span className="text-sm font-semibold">{inStock} Products · {inStockPercent}%</span>
        </div>
      </div>
    </div>
  );
}
