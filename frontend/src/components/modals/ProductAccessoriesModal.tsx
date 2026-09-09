import { useState } from 'react';
import Tumbler from '../../assets/images/tumbler.png';
import AddToCart from '../../assets/images/Cart.svg';

interface ProductAccessoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductAccessoriesModal({ isOpen, onClose }: ProductAccessoriesModalProps) {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center backdrop-blur-xs bg-white/5"
      onClick={onClose}
    >
      <div
        className="bg-white p-2 rounded-[20px] shadow-lg relative w-200 h-100"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-row p-8 gap-5">
          <div className="flex items-start justify-center">
            <img src={Tumbler} alt="Tumbler" className="w-620 max-w-full h-auto rounded-[20px]" />
          </div>
          <div className="flex flex-col justify-start">
            <div>
              <h2 className="font-semibold text-[24px] leading-tight text-based/6 whitespace-nowrap">Tumbler</h2>
            </div>
            <div className="mt-2 text-[12px]">
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
            </div>
            <div className="mt-3 flex flex-row gap-2">
              <h1 className="text-[#9C0306] font-semibold text-[24px]">₱515.00</h1>
              <h1 className="text-[#727272] font-semibold text-[24px] line-through">₱650.00</h1>
            </div>
            <div className="mt-5 flex flex-row gap-4 items-center">
              <span className="text-[12px]">Quantity</span>
              <div className="flex flex-row">
                <button
                  type="button"
                  className="w-6 h-6 flex items-center justify-center border border-[#DDDDDD] text-lg font-bold bg-white"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >
                  -
                </button>
                <span className="w-13 h-6 text-center text-[#9C0306] border border-[#DDDDDD]">{quantity}</span>
                <button
                  type="button"
                  className="w-6 h-6 flex items-center justify-center border border-[#DDDDDD] text-lg font-bold bg-white"
                  onClick={() => setQuantity(q => q + 1)}
                >
                  +
                </button>
              </div>
              <span className="text-[#7F7F7F] text-[10px] font-light">200 pieces available</span>
            </div>
            <div className="mt-6 flex flex-row gap-3">
              <div className="absolute flex flex-row gap-3">
                <button className="bg-white border border-[#9C0306] w-40 h-10 rounded-[10px] flex justify-center items-center hover:cursor-pointer">
                  <img src={AddToCart} alt="Add to Cart" className="mr-2" />
                  <span className="text-[#9C0306] text-[16px] font-semibold hover:cursor-pointer">Add to Cart</span>
                </button>
                <button className="bg-[#9C0306] w-40 h-10 rounded-[10px] flex justify-center items-center hover:cursor-pointer">
                  <span className="text-white text-[16px] font-semibold hover:cursor-pointer">Buy Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
