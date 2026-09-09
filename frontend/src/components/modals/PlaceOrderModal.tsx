interface PlaceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function PlaceOrderModal({ isOpen, onClose, onConfirm }: PlaceOrderModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center backdrop-blur-xs bg-black/5"
      onClick={onClose}
    >
      <div
        className="bg-[#F6F6F6] shadow-lg relative w-120 h-50 rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col p-10 items-center justify-center">
          <h1>Are you sure you want to place order?</h1>
          <div className="flex flex-row text-center py-1">
            <h1 className="text-[14px] font-medium text-[#9C0306]">Double check your items and methods before proceeding.</h1>
          </div>
          <div className="flex flex-row gap-3 mt-5">
            <button
              type="button"
              onClick={onConfirm}
              className="flex justify-center items-center bg-[#9C0306] text-white text-[16px] font-semibold w-30 h-10 rounded-[5px] hover:cursor-pointer"
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
