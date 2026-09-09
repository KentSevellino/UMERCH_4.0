import api from '../../services/api';

interface Product {
  order_id: number | string;
}

interface DeliverModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  onDeleted?: () => void;
  onBackToOrder?: () => void;
  onShowToast?: (message: string, type: 'success' | 'error') => void;
}

export default function DeliverModal({ open, onClose, product, onDeleted, onBackToOrder, onShowToast }: DeliverModalProps) {
  if (!open || !product) return null;

  const handleDeliver = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      console.log(`📦 Attempting to mark order ${product.order_id} as Out-of-delivery...`);
      const response = await api.put(`/admin/orders/${product.order_id}/status`, {
        status: 'Out-of-delivery'
      });
      console.log('✅ Deliver response:', response.data);
      if (onShowToast) onShowToast('Order marked as out for delivery!', 'success');
      if (onDeleted) onDeleted();
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error: any) {
      console.error('❌ Error delivering order:', error);
      console.error('❌ Error response:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to deliver order';
      if (onShowToast) onShowToast(errorMsg, 'error');
      alert(`Failed to deliver order: ${errorMsg}`);
    }
  };

  return (
    <div
      className='fixed inset-0 z-[60] flex justify-center items-center backdrop-blur-xs bg-black/5'
      onClick={onClose}
    >
      <div
        className="bg-[#F6F6F6] shadow-lg relative w-120 h-50 rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className='flex flex-col p-10 items-center justify-center'>
          <div className='p-4'>
            <h1>Are you sure you want to mark this order as delivered?</h1>
          </div>
          <div className='flex flex-col items-center'>
          </div>
          <div className='flex flex-row gap-3 mt-5'>
            <button type='button' className='flex justify-center items-center bg-[#9C0306] text-white text-[16px] font-semibold w-30 h-10 rounded-[5px] hover:cursor-pointer' onClick={(e) => { e.stopPropagation(); handleDeliver(e); }}>
              Yes
            </button>
            <button type='button' className='flex justify-center items-center bg-white text-[#9C0306] text-[16px] font-semibold border border-[#9C0306] w-30 h-10 rounded-[5px] hover:cursor-pointer' onClick={(e) => { e.stopPropagation(); onBackToOrder?.(); }}>
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
