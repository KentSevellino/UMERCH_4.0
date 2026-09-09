interface OrderItem {
  product?: {
    product_image?: string;
    product_name?: string;
  };
  variant?: string;
  quantity?: number;
  price?: number;
}

interface Order {
  user_fullname?: string;
  order_id: number | string;
  order_status?: string;
  receipt_form?: string;
  order_items?: OrderItem[];
  payment_method?: string;
  fulfillment_method?: string;
  order_total?: number;
}

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onReceiptOpen?: () => void;
  onPrepareOpen?: () => void;
  onDeclineOpen?: () => void;
}

export default function ReceiveModal({ isOpen, onClose, order, onReceiptOpen, onPrepareOpen, onDeclineOpen }: ReceiveModalProps) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-red-700">{order.user_fullname || 'Customer'}</h2>
            <p className="text-gray-600 text-sm">Order ID: {order.order_id}</p>
          </div>
          <div className="flex gap-3">
            {order.receipt_form && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                  onReceiptOpen?.();
                }}
                className="text-red-700 hover:text-red-900 font-semibold"
              >
                View File
              </button>
            )}
            <span className={`px-4 py-1 rounded-full text-sm font-semibold ${
              order.order_status?.toLowerCase() === 'pending' ? 'bg-gray-300 text-gray-700' :
              order.order_status?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {order.order_status || 'Pending'}
            </span>
          </div>
        </div>

        {/* Products */}
        <div className="space-y-4 mb-8 pb-8 border-b">
          {order.order_items?.map((item, idx) => (
            <div key={idx} className="flex gap-4">
              {item.product?.product_image && (
                <img
                  src={item.product.product_image}
                  alt={item.product.product_name}
                  className="w-20 h-20 rounded object-cover"
                />
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

        {/* Details */}
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

        {/* Order Total */}
        <div className="flex justify-between items-center mb-8 pb-8 border-b">
          <span className="text-gray-700 font-medium">Order Total:</span>
          <span className="text-red-700 text-3xl font-bold">₱{Number(order.order_total || 0).toFixed(2)}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              onPrepareOpen?.();
            }}
            className="flex-1 bg-[#9C0306] hover:cursor-pointer text-white py-3 rounded-[10px] font-semibold"
          >
            Prepare
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              onDeclineOpen?.();
            }}
            className="flex-1 border-2 border-[#9C0306] text-[#9C0306] hover:cursor-pointer py-3 rounded-[10px] font-semibold"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
