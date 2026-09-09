import { useEffect, useState } from 'react';
import Sidebar from '../../components/layouts/Sidebar';
import AdminFooter from '../../components/layouts/AdminFooter';
import api from '../../services/api';

import TodayEarningsIcon from '../../assets/images/TodayEarnings.svg';
import TodayProductsIcon from '../../assets/images/TodayProducts.svg';
import TodaySalesIcon from '../../assets/images/TodaySales.svg';
import TotalLoginUserIcon from '../../assets/images/TotalLoginUser.svg';

import SalesOverview from '../../components/dashboard-tables/SalesOverview';
import InventoryStatus from '../../components/dashboard-tables/InventoryStatus';
import RecentTransaction from '../../components/dashboard-tables/RecentTransaction';
import TopProducts from '../../components/dashboard-tables/TopProducts';

interface Stats {
  todayEarnings: number;
  todayProducts: number;
  todaySales: number;
  todaySalesAmount: number;
  totalUsers: number;
}

interface InventoryStatusData {
  lowStock: number;
  outOfStock: number;
  inStock: number;
  lowStockPercent: number;
  outOfStockPercent: number;
  inStockPercent: number;
}

interface WeeklyStats {
  revenue: number;
  revenueChange: number;
  orders: number;
  ordersChange: number;
  sales: number;
  salesChange: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  bgColor: string;
}

const StatCard = ({ title, value, subtitle, icon, bgColor }: StatCardProps) => (
  <div className={`w-[300px] h-[130px] rounded-xl px-6 py-4 text-white flex items-center justify-between ${bgColor}`}>
    <div>
      <div className="text-lg opacity-90">{title}</div>
      <div className="text-4xl font-bold mt-1">{value}</div>
      {subtitle && <div className="text-xs opacity-75 mt-1">{subtitle}</div>}
    </div>
    <div className="w-14 h-14 rounded-lg flex items-center justify-center">
      <img src={icon} alt={title} className="w-20 h-20" />
    </div>
  </div>
);

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    todayEarnings: 0,
    todayProducts: 0,
    todaySales: 0,
    todaySalesAmount: 0,
    totalUsers: 0,
  });
  const [salesOverview, setSalesOverview] = useState([]);
  const [inventoryStatus, setInventoryStatus] = useState<InventoryStatusData>({
    lowStock: 0,
    outOfStock: 0,
    inStock: 0,
    lowStockPercent: 0,
    outOfStockPercent: 0,
    inStockPercent: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    revenue: 0,
    revenueChange: 0,
    orders: 0,
    ordersChange: 0,
    sales: 0,
    salesChange: 0,
  });
  const [salesPeriod, setSalesPeriod] = useState('daily');
  const [topProductsPeriod, setTopProductsPeriod] = useState('weekly');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchSalesOverview();
  }, [salesPeriod]);

  useEffect(() => {
    fetchTopProducts();
  }, [topProductsPeriod]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, inventoryRes, transactionsRes, weeklyRes] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/dashboard/inventory-status'),
        api.get('/admin/dashboard/recent-transactions'),
        api.get('/admin/dashboard/weekly-stats'),
      ]);
      setStats(statsRes.data);
      setInventoryStatus(inventoryRes.data);
      setRecentTransactions(transactionsRes.data);
      setWeeklyStats(weeklyRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchSalesOverview = async () => {
    try {
      const res = await api.get(`/admin/dashboard/sales-overview?period=${salesPeriod}`);
      setSalesOverview(res.data);
    } catch (error) {
      console.error('Error fetching sales overview:', error);
    }
  };

  const fetchTopProducts = async () => {
    try {
      const res = await api.get(`/admin/dashboard/top-products?period=${topProductsPeriod}`);
      setTopProducts(res.data);
    } catch (error) {
      console.error('Error fetching top products:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      <div className="h-screen sticky top-0">
        <Sidebar />
      </div>

      <main className="flex-1 px-10 py-10">
        <h1 className="text-4xl font-extrabold tracking-[0.25em]">DASHBOARD</h1>
        <p className="text-gray-500 mt-2">Welcome back Admin, everything looks great.</p>

        <div className="flex flex-wrap gap-5 mt-8">
          <StatCard
            title="Today Earnings"
            value={`₱${stats.todayEarnings?.toLocaleString() || 0}`}
            subtitle="+0% vs yesterday"
            icon={TodayEarningsIcon}
            bgColor="bg-[#5C975A]"
          />
          <StatCard
            title="Today Products"
            value={stats.todayProducts || 0}
            subtitle="Active Inventory Items"
            icon={TodayProductsIcon}
            bgColor="bg-[#F7962A]"
          />
          <StatCard
            title="Total Sales"
            value={`₱${stats.totalSalesAmount?.toLocaleString() || 0}`}
            icon={TodaySalesIcon}
            bgColor="bg-[#EF2F2A]"
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers || 0}
            icon={TotalLoginUserIcon}
            bgColor="bg-[#9C0306]"
          />
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Charts & Metrics</h2>
            <div className="flex gap-2">
              {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSalesPeriod(period)}
                  className={`px-4 py-2 text-sm rounded-lg border ${salesPeriod === period
                    ? 'bg-white border-gray-300 font-semibold'
                    : 'bg-transparent border-gray-200 text-gray-500'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-6">
            <SalesOverview salesOverview={salesOverview} weeklyStats={weeklyStats} />
            <InventoryStatus inventoryStatus={inventoryStatus} />
          </div>
        </div>

        <div className="flex gap-6 mt-8">
          <RecentTransaction recentTransactions={recentTransactions} />
          <TopProducts topProducts={topProducts} topProductsPeriod={topProductsPeriod} setTopProductsPeriod={setTopProductsPeriod} />
        </div>

        <AdminFooter />
      </main>
    </div>
  );
}
