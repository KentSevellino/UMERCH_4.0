import React from 'react';

interface SalesOverviewItem {
  label: string;
  value: number;
}

interface WeeklyStats {
  revenue: number;
  revenueChange: number;
  orders: number;
  ordersChange: number;
  sales: number;
  salesChange: number;
}

interface MiniStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  change?: number;
  iconBgColor: string;
}

const MiniStatCard: React.FC<MiniStatCardProps> = ({ icon, label, value, change, iconBgColor }) => (
  <div className="flex items-center gap-3">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBgColor}`}>
      {icon}
    </div>
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-bold text-gray-800"> {value?.toLocaleString() || 0}</div>
      {change !== undefined && (
        <div className={`text-xs ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {change >= 0 ? '+' : ''}{change}% This Week
        </div>
      )}
    </div>
  </div>
);

interface SalesOverviewProps {
  salesOverview: SalesOverviewItem[];
  weeklyStats: WeeklyStats;
}

export default function SalesOverview({ salesOverview, weeklyStats }: SalesOverviewProps) {
  const maxSalesValue = Math.max(...salesOverview.map(s => s.value), 1);

  return (
    <div className="flex-1 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Sales Overview</h3>
        {salesOverview.length > 0 && (
          <div className="text-right">
            <div className="text-xs text-gray-500">● Today</div>
            <div className="text-xl font-bold text-[#8B6914]">
              ₱{salesOverview[salesOverview.length - 1]?.value?.toLocaleString() || 0}
            </div>
          </div>
        )}
      </div>

      <div className="flex">
        <div className="flex flex-col justify-between text-xs text-gray-400 pr-2 h-[200px]">
          <span>₱{Math.round(maxSalesValue * 1).toLocaleString()}</span>
          <span>₱{Math.round(maxSalesValue * 0.75).toLocaleString()}</span>
          <span>₱{Math.round(maxSalesValue * 0.5).toLocaleString()}</span>
          <span>₱{Math.round(maxSalesValue * 0.25).toLocaleString()}</span>
          <span>₱0</span>
        </div>

        <div className="flex-1 h-[200px] flex items-end justify-between gap-2 border-l border-b border-gray-200 pl-4 pb-2">
          {salesOverview.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className="w-full max-w-[40px] bg-gradient-to-t from-[#FFD700] to-[#FFA500] rounded-t-lg transition-all duration-300"
                style={{
                  height: `${(item.value / maxSalesValue) * 180}px`,
                  minHeight: item.value > 0 ? '10px' : '2px',
                }}
              />
              <span className="text-xs text-gray-500 mt-2">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-6 pt-6 border-t border-gray-200">
        <MiniStatCard
          icon={<div className="w-3 h-3 bg-red-500 rounded-full" />}
          label="Revenue"
          value={weeklyStats.revenue}
          change={weeklyStats.revenueChange}
          iconBgColor="bg-red-100"
        />
        <MiniStatCard
          icon={<div className="w-3 h-3 bg-yellow-500 rounded-full" />}
          label="Orders"
          value={weeklyStats.orders}
          change={weeklyStats.ordersChange}
          iconBgColor="bg-yellow-100"
        />
        <MiniStatCard
          icon={<div className="w-3 h-3 bg-blue-500 rounded-full" />}
          label="Sales"
          value={weeklyStats.sales}
          change={weeklyStats.salesChange}
          iconBgColor="bg-blue-100"
        />
        <MiniStatCard
          icon={<div className="w-3 h-3 bg-green-500 rounded-full" />}
          label="Revenue"
          value={weeklyStats.revenue}
          iconBgColor="bg-green-100"
        />
      </div>
    </div>
  );
}
