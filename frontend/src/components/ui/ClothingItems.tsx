import { useState } from 'react';
import Tshirt from '../../assets/images/tshirt.jpg';

export default function ClothingItems() {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex flex-row justify-center items-center">
      <div className="bg-white w-263 h-45 rounded-[10px] flex items-center p-3 gap-6">
        <input type="checkbox" className="w-3 h-3 accent-[#9C0306]" />
        <img src={Tshirt} alt="Tshirt" className="w-35 rounded-[10px]" />
        <div className="flex flex-col text-start justify-center items-start gap-y-3">
          <h1 className="text-[15px] font-semibold text-start">UM CCE Esports Jersey</h1>
          <p className="text-[10px] leading-tight">
            Lorem ipsum dolor sit amet, <br />
            consectetur adipiscing elit.
          </p>
        </div>
        <div className="flex flex-col">
          <div className="flex flex-row">
            <label htmlFor="Variations" className="text-[13px] text-[#575757]">
              Variations:{' '}
            </label>
            <select name="Variations" id="Variations" className="text-[#575757]">
              <option value=""></option>
            </select>
          </div>
          <label htmlFor="Sizes" className="text-[13px] text-[#575757]">
            Medium
          </label>
        </div>
        <div className="ml-auto flex flex-row gap-23 text-[13px]">
          <span className="text-[13px] transform translate-x-[50px]">₱500</span>
          <div className="flex flex-row transform translate-x-[37px]">
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
          <span className="text-[#9C0306] text-[13px] transform translate-x-[20px]">₱500</span>
          <div className="border border-[#9C0306] transform translate-x-[-2px] flex items-center justify-center w-20 h-8 rounded-[10px] hover:cursor-pointer">
            <button className="text-[#9C0306] text-[13px] font-medium hover:cursor-pointer">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}
