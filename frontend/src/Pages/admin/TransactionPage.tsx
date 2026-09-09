import Sidebar from '../../components/layouts/Sidebar';
import AdminFooter from '../../components/layouts/AdminFooter';
import PrepareModal from '../../components/modals/PrepareModal';
import DeclineModal from '../../components/modals/DeclineModal';
import DeliverModal from '../../components/modals/DeliverModal';
import ReadyForPickupModal from '../../components/modals/ReadyForPickupModal';
import ViewReceiptFormModal from '../../components/modals/ViewReceiptFormModal';
import { useTransaction } from '../../hooks/useTransaction';

import CompletedIcon from '../../assets/images/Completed.svg';
import PendingIcon from '../../assets/images/Pending.svg';
import ProcessingIcon from '../../assets/images/Processing.svg';
import OutForDeliveryIcon from '../../assets/images/OutForDelivery.svg';
import CancelledIcon from '../../assets/images/Cancelled.svg';
import SearchIcon from '../../assets/images/SearchIcon.svg';

interface StatCardProps {
  title: string;
  value: number;
  className?: string;
  icon?: React.ReactNode;
}

const StatCard = ({ title, value, className, icon }: StatCardProps) => (
  <div className={`w-[300px] h-[130px] rounded-xl px-6 py-4 text-white flex items-center justify-between ${className}`}>
    <div>
      <div className="text-lg opacity-90">{title}</div>
      <div className="text-3xl font-bold leading-tight mt-1">{value}</div>
    </div>
    <div className="w-12 h-12 rounded-lg flex items-center justify-center">{icon}</div>
  </div>
);

interface OrderModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onReceiptOpen: () => void;
  onPrepareOpen: () => void;
  onDeclineOpen: () => void;
  onDeliverOpen: () => void;
  onReadyForPickupOpen: () => void;
}

const OrderModal = ({ order, isOpen, onClose, onReceiptOpen, onPrepareOpen, onDeclineOpen, onDeliverOpen, onReadyForPickupOpen }: OrderModalProps) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-red-700">{order.user_fullname || 'Customer'}</h2>
            <p className="text-gray-600 text-sm">Order ID: {order.order_id}</p>
          </div>
          <div className="flex gap-3">
            {order.receipt_form && (
              <button
                onClick={(e) => { e.stopPropagation(); onClose(); onReceiptOpen(); }}
                className="text-red-700 hover:text-red-900 font-semibold"
              >
                View File
              </button>
            )}
            <span className={`px-4 py-1 rounded-full text-sm font-semibold ${order.order_status?.toLowerCase() === 'pending' ? 'bg-gray-300 text-gray-700' :
              order.order_status?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {order.order_status || 'Pending'}
            </span>
          </div>
        </div>

        <div className="space-y-4 mb-8 pb-8 border-b">
          {order.order_items?.map((item: any, idx: number) => (
            <div key={idx} className="flex gap-4">
              {item.product?.product_image && (
                <img src={item.product.product_image} alt={item.product.product_name} className="w-20 h-20 rounded object-cover" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.product?.product_name || 'Product'}</h3>
                <p className="text-gray-600 text-sm">{item.variant || 'Standard'}</p>
                <div className="flex justify-between items-end mt-2">
                  <p className="text-sm text-gray-600">x{item.quantity}</p>
                  <p className="text-red-700 font-bold text-lg">₱{Number(item.price || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between">
            <span className="text-gray-700">Payment Method:</span>
            <span className="font-semibold">{order.payment_method || 'Cashier Payment'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Fulfillment Method:</span>
            <span className="font-semibold">{order.fulfillment_method || 'Delivery'}</span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8 pb-8 border-b">
          <span className="text-gray-700 font-medium">Order Total:</span>
          <span className="text-red-700 text-3xl font-bold">₱{Number(order.order_total || 0).toFixed(2)}</span>
        </div>

        <div className="flex gap-4">
          {order.order_status?.toLowerCase() === 'pending' && (
            <>
              <button onClick={(e) => { e.stopPropagation(); onClose(); onPrepareOpen(); }} className="flex-1 bg-[#9C0306] hover:cursor-pointer text-white py-3 rounded-[10px] font-semibold">
                Prepare
              </button>
              <button onClick={(e) => { e.stopPropagation(); onClose(); onDeclineOpen(); }} className="flex-1 border-2 border-[#9C0306] text-[#9C0306] hover:cursor-pointer py-3 rounded-[10px] font-semibold">
                Decline
              </button>
            </>
          )}
          {order.order_status?.toLowerCase() === 'processing' && (
            <button onClick={(e) => { e.stopPropagation(); onClose(); onDeliverOpen(); }} className="flex-1 bg-[#9C0306] hover:cursor-pointer text-white py-3 rounded-[10px] font-semibold">
              To Deliver
            </button>
          )}
          {order.order_status?.toLowerCase() === 'out-of-delivery' && (
            <button onClick={(e) => { e.stopPropagation(); onClose(); onReadyForPickupOpen(); }} className="flex-1 bg-[#9C0306] hover:cursor-pointer text-white py-3 rounded-[10px] font-semibold">
              Ready for Pickup
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function TransactionPage() {
  const {
    query, setQuery, status, setStatus, orders, loading, selectedOrder, setSelectedOrder, isModalOpen,
    setIsModalOpen, isReceiptModalOpen, setIsReceiptModalOpen, isPrepareModalOpen, setIsPrepareModalOpen,
    isDeclineModalOpen, setIsDeclineModalOpen, isDeliverModalOpen, setIsDeliverModalOpen,
    isReadyForPickupModalOpen, setIsReadyForPickupModalOpen, toast, currentPage, showToast,
    handleOrderUpdated, filtered, totalPages, paginatedOrders, goToPage, stats: statsData,
  } = useTransaction();

  const stats = [
    { ...statsData[0], className: "bg-[#5C975A]", icon: <img src={CompletedIcon} alt="Completed" className="w-20 h-20" /> },
    { ...statsData[1], className: "bg-[#F7962A]", icon: <img src={PendingIcon} alt="Pending" className="w-20 h-20" /> },
    { ...statsData[2], className: "bg-[#4F46E5]", icon: <img src={ProcessingIcon} alt="Processing" className="w-20 h-20" /> },
    { ...statsData[3], className: "bg-[#EF2F2A]", icon: <img src={OutForDeliveryIcon} alt="Out for Delivery" className="w-20 h-20" /> },
    { ...statsData[4], className: "bg-[#9C0306]", icon: <img src={CancelledIcon} alt="Cancelled" className="w-20 h-20" /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      <div className="h-screen sticky top-0">
        <Sidebar />
      </div>

      <main className="flex-1 px-10 py-10">
        <h1 className="text-4xl font-extrabold tracking-[0.25em]">TRANSACTIONS</h1>
        <p className="text-gray-500 mt-2">Welcome back Admin, everything looks great.</p>

        <div className="flex flex-wrap gap-6 mt-8">
          {stats.map((s) => (
            <StatCard key={s.title} {...s} />
          ))}
        </div>

        <h2 className="text-2xl font-bold mt-10 mb-4">Orders</h2>

        <div className="flex items-center justify-between gap-6 mb-4">
          <div className="flex items-center gap-3 flex-1 max-w-[520px] bg-white border border-gray-200 rounded-lg px-4 py-3">
            <img src={SearchIcon} alt="Search" className="w-5 h-5" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Order ID"
              className="bg-transparent outline-none w-full text-sm text-gray-700 placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-5 py-3 text-sm bg-white min-w-[190px]"
            >
              <option value="All statuses">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Processing">Processing</option>
              <option value="out-of-delivery">Out for Delivery</option>
              <option value="Ready-for-pickup">Ready for Pickup</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-24 text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 text-gray-400">No orders found</div>
          ) : (
            paginatedOrders.map((order) => (
              <div
                key={order.order_id}
                onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-start flex-1">
                  <div>
                    <p className="font-semibold text-gray-900">{order.user_fullname || order.user?.name || 'Customer'}</p>
                    <p className="text-sm text-gray-600">Order ID: {order.order_id}</p>
                    <p className="text-xs text-gray-400 mt-1">{Math.floor((Date.now() - new Date(order.created_at || '').getTime()) / 60000)} mins ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 flex-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.order_status?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.order_status?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                    order.order_status?.toLowerCase() === 'processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.order_status || 'Pending'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.receipt_form ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {order.receipt_form ? 'File Uploaded' : 'No file uploaded'}
                  </span>
                </div>

                <div className="flex items-center gap-6 justify-end">
                  <div className="text-right">
                    <p className="text-xs text-red-600 font-semibold">To Pay</p>
                    <p className="text-lg font-bold text-red-700">₱{Number(order.order_total || 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filtered.length > 0 && (
          <>
            <div className="border-t border-gray-200" />
            <div className="py-7 flex items-center justify-center gap-10 text-sm font-semibold">
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="text-gray-900 hover:text-[#9C0306] disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => goToPage(page)} className={`${page === currentPage ? 'text-[#9C0306]' : 'text-gray-900 hover:text-[#9C0306]'}`}>
                  {page}
                </button>
              ))}
              <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="text-gray-900 hover:text-[#9C0306] disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            </div>
          </>
        )}
        <AdminFooter />
      </main>

      <OrderModal order={selectedOrder} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onReceiptOpen={() => setIsReceiptModalOpen(true)} onPrepareOpen={() => setIsPrepareModalOpen(true)} onDeclineOpen={() => setIsDeclineModalOpen(true)} onDeliverOpen={() => setIsDeliverModalOpen(true)} onReadyForPickupOpen={() => setIsReadyForPickupModalOpen(true)} />
      <ViewReceiptFormModal open={isReceiptModalOpen} onClose={() => { setIsReceiptModalOpen(false); setIsModalOpen(true); }} product={selectedOrder} />
      <PrepareModal open={isPrepareModalOpen} onClose={() => { setIsPrepareModalOpen(false); setIsModalOpen(false); }} onBackToOrder={() => { setIsPrepareModalOpen(false); setIsModalOpen(true); }} product={selectedOrder} onDeleted={handleOrderUpdated} onShowToast={showToast} />
      <DeclineModal open={isDeclineModalOpen} onClose={() => { setIsDeclineModalOpen(false); setIsModalOpen(false); }} onBackToOrder={() => { setIsDeclineModalOpen(false); setIsModalOpen(true); }} product={selectedOrder} onDeleted={handleOrderUpdated} onShowToast={showToast} />
      <DeliverModal open={isDeliverModalOpen} onClose={() => { setIsDeliverModalOpen(false); setIsModalOpen(false); }} onBackToOrder={() => { setIsDeliverModalOpen(false); setIsModalOpen(true); }} product={selectedOrder} onDeleted={handleOrderUpdated} onShowToast={showToast} />
      <ReadyForPickupModal open={isReadyForPickupModalOpen} onClose={() => { setIsReadyForPickupModalOpen(false); setIsModalOpen(false); }} onBackToOrder={() => { setIsReadyForPickupModalOpen(false); setIsModalOpen(true); }} product={selectedOrder} onDeleted={handleOrderUpdated} onShowToast={showToast} />

      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white z-[70] animate-pulse ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
