import Sidebar from '../../components/layouts/Sidebar';
import AdminFooter from '../../components/layouts/AdminFooter';
import { useActivityLogs } from '../../hooks/useActivityLogs';

import TotalActivitiesIcon from '../../assets/images/TotalActivities.svg';
import TotalLoginsIcon from '../../assets/images/TotalLogins.svg';
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

function ActivityLogsPage() {
  const { logs, allLogs, loading, query, setQuery, activityFilter, setActivityFilter, currentPage,
    setCurrentPage, totalPages, formatDate, getActivityBadgeColor } = useActivityLogs();

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      <div className="h-screen sticky top-0">
        <Sidebar />
      </div>
      <main className="flex-1 px-10 py-10">
        <h1 className="text-4xl font-extrabold tracking-[0.25em]">RECORD LOGS</h1>
        <p className="text-gray-500 mt-2">Welcome back Admin, everything looks great.</p>

        <div className="mt-7 flex gap-6">
          <StatCard
            title="Total Activities"
            value={allLogs.length}
            className="bg-blue-600"
            icon={<img src={TotalActivitiesIcon} alt="Total Activities" className="w-20 h-20" />}
          />
          <StatCard
            title="Total Logins"
            value={allLogs.filter((log) => log.action === "Login").length}
            className="bg-green-700"
            icon={<img src={TotalLoginsIcon} alt="Total Logins" className="w-20 h-20" />}
          />
        </div>

        <h2 className="text-2xl font-bold mt-10">Activity Logs</h2>

        <div className="mt-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 flex-1 max-w-130 bg-white rounded-lg px-4 py-3 border border-gray-200">
            <img src={SearchIcon} alt="Search" className="w-5 h-5" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search Action, Description"
              className="bg-transparent outline-none w-full text-sm text-gray-700 placeholder:text-gray-400"
            />
          </div>
          <select
            value={activityFilter}
            onChange={(e) => { setActivityFilter(e.target.value); setCurrentPage(1); }}
            className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 outline-none"
          >
            <option value="all">All Activities</option>
            <option value="Login">Login</option>
            <option value="Logout">Logout</option>
          </select>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-sm overflow-visible">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr className="text-left text-red-700 text-sm font-semibold">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Date/Time</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-10 text-gray-500">Loading...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-10 text-gray-500">No activity logs found</td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.activity_logs_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-700">{log.activity_logs_id}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActivityBadgeColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{log.description}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{formatDate(log.created_at)}</td>
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

export default ActivityLogsPage;
