import api from '../../services/api';

interface CartItem {
  cart_item_id: number;
}

interface RemoveCartModalProps {
  open: boolean;
  onClose: () => void;
  cartItem: CartItem | null;
  onDeleted?: (id: number) => void;
}

export default function RemoveCartModal({ open, onClose, cartItem, onDeleted }: RemoveCartModalProps) {
  if (!open || !cartItem) return null;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await api.delete(`/cart/${cartItem.cart_item_id}`);
      if (onDeleted) onDeleted(cartItem.cart_item_id);
      onClose();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center backdrop-blur-xs bg-black/5"
      onClick={onClose}
    >
      <div
        className="bg-[#F6F6F6] shadow-lg relative w-120 h-40 rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col p-7 items-center justify-center">
          <h1>Are you sure you want to remove this item from your cart?</h1>
          <div className="py-2 flex flex-col items-center" />
          <div className="flex flex-row gap-3">
            <button
              type="button"
              className="flex justify-center items-center bg-[#9C0306] text-white text-[16px] font-semibold w-30 h-10 rounded-[5px] hover:cursor-pointer"
              onClick={handleDelete}
            >
              Yes
            </button>
            <button
              type="button"
              className="flex justify-center items-center bg-white text-[#9C0306] text-[16px] font-semibold border border-[#9C0306] w-30 h-10 rounded-[5px] hover:cursor-pointer"
              onClick={onClose}
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
