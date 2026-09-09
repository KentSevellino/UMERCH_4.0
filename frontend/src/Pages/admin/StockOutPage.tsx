import Sidebar from '../../components/layouts/Sidebar';
import AdminFooter from '../../components/layouts/AdminFooter';
import { useStockOut } from '../../hooks/useStockOut';

import TotalStocks from '../../assets/images/TotalStocks.svg';
import LowStocks from '../../assets/images/LowStocks.svg';
import OutOfStocks from '../../assets/images/OutOfStocks.svg';
import SearchIcon from '../../assets/images/SearchIcon.svg';

interface StatCardProps {
  title: string;
  value: string | number;
  bg: string;
  icon: string;
}

const StatCard = ({ title, value, bg, icon }: StatCardProps) => (
  <div className={`w-[300px] h-[130px] rounded-xl px-6 py-4 text-white flex items-center justify-between ${bg}`}>
    <div>
      <p className="text-lg opacity-90">{title}</p>
      <p className="text-4xl font-bold mt-1">{value}</p>
    </div>
    <img src={icon} alt={title} className="w-16 h-16" />
  </div>
);

export default function StockOutPage() {
  const { logs, allLogs, stocks, searchQuery, setSearchQuery, currentPage, setCurrentPage, totalPages } = useStockOut();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="h-screen sticky top-0">
        <Sidebar />
      </div>

      <div className="flex-1 px-10 py-10">
        <h1 className="text-4xl font-extrabold tracking-[0.25em] mb-1">INVENTORY</h1>
        <p className="text-gray-500 mb-6">Welcome back Admin, everything looks great.</p>

        <div className="flex gap-6 mb-10 flex-wrap">
          <StatCard title="Total Stocks" value={stocks.length} bg="bg-[#5C975A]" icon={TotalStocks} />
          <StatCard
            title="Low Stocks"
            value={stocks.filter((s) => s.stock_qty > 0 && s.stock_qty <= 20).length}
            bg="bg-[#F7962A]"
            icon={LowStocks}
          />
          <StatCard title="Out of Stocks" value={stocks.filter((s) => s.stock_qty === 0).length} bg="bg-[#EF2F2A]" icon={OutOfStocks} />
        </div>

        <h2 className="text-2xl font-bold mb-4">Stock Out</h2>

        <div className="mt-4 mb-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 flex-1 max-w-[520px] h-12 bg-white rounded-lg px-4 py-3 border border-gray-200">
            <img src={SearchIcon} alt="Search" className="w-5 h-5" />
            <input
              type="text"
              placeholder="Search Product Name"
              className="bg-transparent outline-none w-full text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="grid gap-4 px-8 py-4 text-sm font-bold text-red-700 border-b" style={{ gridTemplateColumns: '1.5fr 2fr 1fr 0.7fr 1.2fr 1.5fr' }}>
            <div>Date / Time</div>
            <div>Product</div>
            <div className="text-center">Variant</div>
            <div className="text-center">Qty</div>
            <div className="text-center">Reason</div>
            <div>Modifier</div>
          </div>

          <div className="min-h-[420px]">
            {logs.length === 0 ? (
              <div className="text-center py-24 text-gray-400">No stock-out records found</div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="grid gap-4 px-8 py-4 border-b text-sm items-center"
                  style={{ gridTemplateColumns: '1.5fr 2fr 1fr 0.7fr 1.2fr 1.5fr' }}
                >
                  <div className="text-gray-700 text-xs">{log.date_time}</div>
                  <div className="text-gray-800 font-medium text-sm">{log.product_name}</div>
                  <div className="text-center text-gray-700 text-sm">{log.variant || '-'}</div>
                  <div className="text-center font-bold text-gray-900">{log.quantity}</div>
                  <div className="flex justify-center">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                      log.reason === 'defected' ? 'bg-red-100 text-red-700' :
                      log.reason === 'damaged' ? 'bg-orange-100 text-orange-700' :
                      log.reason === 'return' ? 'bg-blue-100 text-blue-700' :
                      log.reason === 'adjustment' ? 'bg-purple-100 text-purple-700' :
                      log.reason === 'order' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {log.reason === 'order' ? 'Order Completed' : log.reason}
                    </span>
                  </div>
                  <div className="text-gray-700 text-sm">{log.modified_by}</div>
                </div>
              ))
            )}
          </div>

          {allLogs.length > 0 && totalPages > 1 && (
            <>
              <div className="border-t border-gray-200" />
              <div className="py-4 flex items-center justify-center gap-7 text-sm font-semibold">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="text-black hover:text-[#9C0306] disabled:opacity-80 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`${page === currentPage ? 'text-[#9C0306]' : 'text-gray-900 hover:text-[#9C0306]'}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="text-black hover:text-[#9C0306] disabled:opacity-80 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>

        <AdminFooter />
      </div>
    </div>
  );
}
