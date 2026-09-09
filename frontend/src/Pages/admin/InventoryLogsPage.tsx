import Sidebar from '../../components/layouts/Sidebar';
import AdminFooter from '../../components/layouts/AdminFooter';
import { useInventoryLogs } from '../../hooks/useInventoryLogs';

import TotalLogsIcon from '../../assets/images/TotalLogs.svg';
import SearchIcon from '../../assets/images/SearchIcon.svg';

interface StatCardProps {
  title: string;
  value: string | number;
  className?: string;
  icon?: React.ReactNode;
}

const StatCard = ({ title, value, className = "bg-green-700", icon }: StatCardProps) => (
  <div className={`w-[300px] h-[130px] rounded-xl px-6 py-4 text-white flex items-center justify-between ${className}`}>
    <div>
      <div className="text-lg opacity-90">{title}</div>
      <div className="text-4xl font-bold mt-1">{value}</div>
    </div>
    <div className="w-12 h-12 rounded-lg flex items-center justify-center">{icon}</div>
  </div>
);

function InventoryLogsPage() {
  const { logs, allLogs, loading, query, setQuery, typeFilter, setTypeFilter, currentPage, setCurrentPage,
    totalPages, formatDate, getTypeBadgeColor } = useInventoryLogs();

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      <div className="h-screen sticky top-0">
        <Sidebar />
      </div>
      <main className="flex-1 px-10 py-10">
        <h1 className="text-4xl font-extrabold tracking-[0.25em]">RECORD LOGS</h1>
        <p className="text-gray-500 mt-2">Track all inventory movements and changes</p>

        <div className="mt-7 flex gap-6">
          <StatCard
            title="Total Logs"
            value={allLogs.length}
            className="bg-blue-600"
            icon={<img src={TotalLogsIcon} alt="Total Logs" className="w-20 h-20" />}
          />
        </div>

        <h2 className="text-2xl font-bold mt-10">Inventory Logs</h2>

        <div className="mt-7 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 flex-1 max-w-130 bg-white rounded-lg px-4 py-3 border border-gray-200">
            <img src={SearchIcon} alt="Search" className="w-5 h-5" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by Item Name"
              className="bg-transparent outline-none w-full text-sm text-gray-700 placeholder:text-gray-400"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 outline-none"
          >
            <option value="all">All Types</option>
            <option value="Stock In">Stock In</option>
            <option value="Stock Out">Stock Out</option>
            <option value="Add Product">Add Product</option>
            <option value="Edit Product">Edit Product</option>
            <option value="Delete Product">Delete Product</option>
            <option value="Archived">Archived</option>
            <option value="Restored">Restored</option>
          </select>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-sm overflow-visible">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr className="text-left text-red-700 text-sm font-semibold">
                  <th className="px-6 py-4">Date/Time</th>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Item Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Qty</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Action By</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-500">Loading...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-500">No inventory logs found</td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-700">{formatDate(log.created_at)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">#{log.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{log.item_name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeBadgeColor(log.type)}`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{log.quantity > 0 ? `+${log.quantity}` : log.quantity}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{log.total}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{log.admin_action}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && logs.length > 0 && (
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
      </main>
    </div>
  );
}

export default InventoryLogsPage;
