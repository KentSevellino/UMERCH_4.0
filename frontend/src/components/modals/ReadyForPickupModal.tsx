import api from '../../services/api';

interface Product {
  order_id: number | string;
  campus?: string;
}

interface ReadyForPickupModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  onDeleted?: () => void;
  onBackToOrder?: () => void;
  onShowToast?: (message: string, type: 'success' | 'error') => void;
}

export default function ReadyForPickupModal({ open, onClose, product, onDeleted, onBackToOrder, onShowToast }: ReadyForPickupModalProps) {
  if (!open || !product) return null;

  const handleReadyForPickup = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await api.put(`/admin/orders/${product.order_id}/status`, {
        status: 'Ready-for-pickup'
      });
      if (onShowToast) onShowToast(`Order is ready for pickup at ${product.campus}!`, 'success');
      if (onDeleted) onDeleted();
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error marking order as ready for pickup:', error);
      if (onShowToast) onShowToast('Failed to mark order as ready for pickup', 'error');
      alert('Failed to mark order as ready for pickup');
    }
  };

  return (
    <div
      className='fixed inset-0 z-[60] flex justify-center items-center backdrop-blur-xs bg-black/5'
      onClick={onClose}
    >
      <div
        className="bg-[#F6F6F6] shadow-lg relative w-120 h-auto rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className='flex flex-col p-10 items-center justify-center'>
          <h1 className="text-xl font-semibold mb-4">Ready for Pickup</h1>

          <div className='flex flex-row gap-3 mt-5'>
            <button
              type='button'
              onClick={(e) => { e.stopPropagation(); handleReadyForPickup(e); }}
              className='flex justify-center items-center bg-[#9C0306] text-white text-[16px] font-semibold w-30 h-10 rounded-[5px] hover:cursor-pointer'
            >
              Confirm
            </button>
            <button
              type='button'
              onClick={(e) => { e.stopPropagation(); onBackToOrder?.(); }}
              className='flex justify-center items-center bg-white text-[#9C0306] text-[16px] font-semibold border border-[#9C0306] w-30 h-10 rounded-[5px] hover:cursor-pointer'
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
