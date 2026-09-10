import Sidebar from '../../components/layouts/Sidebar';
import AdminFooter from '../../components/layouts/AdminFooter';
import AddStock from '../../components/modals/AddStocksModal';
import EditStock from '../../components/modals/EditStocks';
import ReceiptForm from '../../components/modals/ReceiptFormModal';
import { normalizeImageUrl } from '../../constants';
import AddStockOut from '../../components/modals/AddStockOutModal';
import { useStockIn } from '../../hooks/useStockIn';

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

export default function StockInPage() {
  const {
    stocks, paginatedStocks, searchQuery, setSearchQuery, openAdd, setOpenAdd, openEdit, setOpenEdit,
    selectedStock, setSelectedStock, toast, showingToast, receiptFormOpen, currentPage, setCurrentPage,
    totalPages, openReceiptForm, closeReceiptForm, fetchStocks, showToast, getStatus, openRemoveStock,
    setOpenRemoveStock,
  } = useStockIn();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="h-screen sticky top-0">
        <Sidebar />
      </div>

      <div className="flex-1 px-10 py-10 flex flex-col">
        <div className="flex-1">
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

        <h2 className="text-2xl font-bold mb-4">Stock In</h2>

        <div className="flex items-center justify-between mb-4">
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
          <div className="flex gap-3">
            <button
              onClick={() => setOpenRemoveStock(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-2 rounded-full text-sm font-semibold hover:cursor-pointer"
            >
              Remove Stock
            </button>
            <button
              onClick={() => setOpenAdd(true)}
              className="bg-red-800 hover:bg-red-900 text-white px-8 py-2 rounded-full text-sm font-semibold hover:cursor-pointer"
            >
              Add Stock
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-12 px-8 py-4 text-sm font-bold text-red-700 border-b border-gray-400/30">
            <div className="col-span-4">Product</div>
            <div className="col-span-2">Cost</div>
            <div className="col-span-2">Stocks</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          <div className="min-h-[420px]">
            {paginatedStocks.map((stock) => {
              const status = getStatus(stock.stock_qty);
              return (
                <div
                  key={stock.stock_in_id}
                  className="grid grid-cols-12 px-8 py-4 border-b border-gray-400/30 items-center text-sm"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <img src={normalizeImageUrl(stock.product_image)} className="w-12 h-12 rounded object-cover" alt="" />
                    <div>
                      <p className="font-semibold">{stock.product_name}</p>
                      <p className="text-xs text-red-600">{stock.variant}</p>
                    </div>
                  </div>
                  <div className="col-span-2">₱{stock.cost}</div>
                  <div className="col-span-2">{stock.stock_qty}</div>
                  <div className={`col-span-2 font-semibold ${status.color}`}>{status.label}</div>
                  <div className="col-span-2 text-right">
                    <button
                      className="bg-red-700 hover:bg-red-800 text-white px-5 py-1.5 rounded-full text-xs font-semibold hover:cursor-pointer"
                      onClick={() => { setSelectedStock(stock); setOpenEdit(true); }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <>
              <div className="border-t border-gray-200" />
              <div className="py-4 flex items-center justify-center gap-7 text-sm font-semibold">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="text-black hover:text-[#9C0306] disabled:opacity-80 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
        </div>

        <AdminFooter />
      </div>
      {showingToast && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg">{toast}</div>
      )}
      <AddStock open={openAdd} onClose={() => setOpenAdd(false)} onSuccess={() => { fetchStocks(); showToast("Stock added successfully!"); }} />
      <EditStock open={openEdit} onClose={() => setOpenEdit(false)} stock={selectedStock} onSuccess={() => { fetchStocks(); showToast("Stock updated successfully!"); }} />
      <ReceiptForm open={receiptFormOpen} onClose={closeReceiptForm} />
      <AddStockOut open={openRemoveStock} onClose={() => setOpenRemoveStock(false)} onSuccess={() => { fetchStocks(); showToast("Stock removed successfully!"); }} />
    </div>
  );
}
