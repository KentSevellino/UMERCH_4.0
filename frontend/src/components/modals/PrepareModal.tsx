import api from '../../services/api';

interface Product {
  order_id: number | string;
  campus?: string;
}

interface PrepareModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  onDeleted?: () => void;
  onBackToOrder?: () => void;
  onShowToast?: (message: string, type: 'success' | 'error') => void;
}

export default function PrepareModal({ open, onClose, product, onDeleted, onBackToOrder, onShowToast }: PrepareModalProps) {
  if (!open || !product) return null;

  const handlePrepare = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await api.put(`/admin/orders/${product.order_id}/status`, {
        status: 'Processing'
      });
      if (onShowToast) onShowToast('Order prepared successfully!', 'success');
      if (onDeleted) onDeleted();
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error preparing order:', error);
      if (onShowToast) onShowToast('Failed to prepare order', 'error');
      alert('Failed to prepare order');
    }
  };

  return (
    <div
      className='fixed inset-0 z-[60] flex justify-center items-center backdrop-blur-xs bg-black/5'
      onClick={onClose}
    >
      <div
        className="bg-[#F6F6F6] shadow-lg relative w-120 h-40 rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className='flex flex-col p-10 items-center justify-center'>
          <h1>Are you sure you want to prepare this order?</h1>
          <div className='py-2 flex flex-col items-center'>
          </div>
          <div className='flex flex-row gap-3 mt-5'>
            <button type='button' className='flex justify-center items-center bg-[#9C0306] text-white text-[16px] font-semibold w-30 h-10 rounded-[5px] hover:cursor-pointer' onClick={(e) => { e.stopPropagation(); handlePrepare(e); }}>
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
