interface Product {
  product_id: number | string;
  receipt_form?: string;
}

interface ViewReceiptFormModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

export default function ViewReceiptFormModal({ open, onClose, product }: ViewReceiptFormModalProps) {
  if (!open || !product) return null;

  return (
    <div
      className='fixed inset-0 z-[60] flex justify-center items-center backdrop-blur-xs bg-black/5'
      onClick={onClose}
    >
      <div
        className="bg-[#F6F6F6] shadow-lg relative w-120 h-100 rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className='flex flex-col p-10 items-center justify-center'>
          <img src={`/storage/${product.receipt_form}`} alt="Receipt Form" className="max-w-full max-h-64 mb-5" />
          <div className='flex flex-row gap-3 mt-5'>
            <button type='button' className='flex justify-center items-center bg-white text-[#9C0306] border border-[#9C0306] text-[16px] font-semibold w-30 h-10 rounded-[5px] hover:cursor-pointer' onClick={(e) => { e.stopPropagation(); onClose(); }}>
              Back
            </button>
            <a href={`/storage/${product.receipt_form}`} download className='flex justify-center items-center bg-[#9C0306] text-white text-[16px] font-semibold border border-[#9C0306] w-30 h-10 rounded-[5px] hover:cursor-pointer'>
              Download
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
