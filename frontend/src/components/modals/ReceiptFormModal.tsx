import { useEffect, useRef } from 'react';
import Check from '../../assets/images/CHECK.svg';
import UMERCH_RECEIPT from '../../assets/images/UMERCH-RECEIPT.svg';
import QRCode from 'qrcode';

interface CartItem {
  product?: { product_name: string };
  name?: string;
  price: number;
  quantity: number;
}

interface ReceiptFormModalProps {
  open: boolean;
  onClose: () => void;
  cartItems?: CartItem[];
  onGoHome?: () => void;
  onTrackOrders?: () => void;
  customerName?: string;
  customerId?: string;
}

export default function ReceiptFormModal({
  open,
  onClose,
  cartItems = [],
  onGoHome,
  onTrackOrders,
  customerName = 'Customer',
  customerId = 'N/A',
}: ReceiptFormModalProps) {
  const qrCodeRef = useRef<HTMLCanvasElement>(null);

  const total = Array.isArray(cartItems)
    ? cartItems.reduce((sum, item) => sum + parseFloat(String(item.price)) * item.quantity, 0)
    : 0;

  useEffect(() => {
    if (open && qrCodeRef.current) {
      const qrData = {
        orderId: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        timestamp: new Date().toISOString(),
        customerName,
        customerId,
        total: total.toFixed(2),
        itemCount: cartItems.length,
      };

      const qrString = JSON.stringify(qrData);

      qrCodeRef.current.innerHTML = '';

      QRCode.toCanvas(qrCodeRef.current, qrString, {
        width: 100,
        height: 20,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      }).catch(err => {
        console.error('Error generating QR code:', err);
      });
    }
  }, [open, cartItems, total, customerName, customerId]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center backdrop-blur-xs bg-black/5"
      onClick={onClose}
    >
      <div
        className="bg-[#F6F6F6] shadow-lg relative w-120 h-180 rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col p-3 items-center justify-center">
          <img src={Check} alt="Check" />
          <div className="py-4">
            <h1 className="text-[#9C0306] font-semibold text-[20px]">Place Order Completed</h1>
          </div>
          <div className="flex flex-col border border-black w-80 h-auto rounded-lg bg-white">
            <div className="mt-3 flex flex-col items-center justify-center gap-2">
              <img src={UMERCH_RECEIPT} alt="UMERCH RECEIPT" className="w-10" />
              <label htmlFor="Purchase Order" className="text-[14px] font-semibold">
                Purchase Order
              </label>
            </div>
            <div className="mt-3 bg-gray-400 border opacity-30 border-gray-500 w-60" />
            <div className="flex flex-col p-3 gap-2 overflow-y-auto max-h-96">
              <div className="flex flex-row justify-between text-[10px]">
                <span>Order#: {String(Math.floor(Math.random() * 10000)).padStart(4, '0')}</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="border-b border-gray-300" />

              <div className="flex flex-col gap-2 text-[10px] mb-3">
                <div>
                  <p className="font-semibold">Name:</p>
                  <p>{customerName}</p>
                </div>
                <div>
                  <p className="font-semibold">ID Number:</p>
                  <p>{customerId}</p>
                </div>
              </div>

              <div className="border-b border-gray-300" />

              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-bold mt-2">Items:</p>
                <div className="flex flex-row justify-between gap-1 text-center">
                  <span className="text-[10px] font-bold">Product</span>
                  <span className="text-[10px] font-bold">Unit Price</span>
                  <span className="text-[10px] font-bold">Qty</span>
                  <span className="text-[10px] font-bold">Subtotal</span>
                </div>
                {Array.isArray(cartItems) &&
                  cartItems.map((item, index) => (
                    <div key={index} className="flex flex-row justify-between gap-1">
                      <span className="text-[10px]">{item.product?.product_name || item.name || 'Product'}</span>
                      <span className="text-[10px]">₱{Number(item.price).toFixed(2)}</span>
                      <span className="text-[10px]">{item.quantity}</span>
                      <span className="text-[10px]">₱{(Number(item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                <div className="border-t border-gray-300 pt-2 mt-2 flex flex-row w-full">
                  <span className="text-[14px] font-bold">TOTAL</span>
                  <div className="ml-auto">
                    <span className="text-[14px] font-bold">₱{total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex flex-col mt-5 items-center">
                  <canvas ref={qrCodeRef} />
                  <p className="text-[12px] font-bold mt-2">KEEP THIS RECEIPT</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex text-center mt-2 mb-4">
            <p className="text-[12px] text-[#9C0306]">Note: You can take a screenshot for proof</p>
          </div>
          <div className="flex flex-row gap-3 items-center text-center">
            <button onClick={onGoHome} className="text-[12px] bg-[#9C0306] text-white w-30 h-10 font-extrabold hover:cursor-pointer">
              Back to Home
            </button>
            <button onClick={onTrackOrders} className="text-[12px] bg-white border border-[#9C0306] text-[#9C0306] w-30 h-10 font-extrabold hover:cursor-pointer">
              Track Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
