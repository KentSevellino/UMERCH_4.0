import React, { useState, useEffect } from "react";
import api from "../../services/api";

interface Stock {
  stock_in_id: number | string;
  product_name: string;
  product_image: string;
  cost: string | number;
  variant: string;
  stock_qty: string | number;
}

interface EditStocksProps {
  open: boolean;
  onClose: () => void;
  stock: Stock | null;
  onSuccess?: () => void;
}

export default function EditStocks({ open, onClose, stock, onSuccess }: EditStocksProps) {
  const [quantity, setQuantity] = useState<string | number>(stock?.stock_qty || "");
  const [quantityError, setQuantityError] = useState("");
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (open && stock) {
      setQuantity(stock.stock_qty);
    }
  }, [open, stock]);

  if (!open || !stock) return null;

  const handleUpdate = async () => {
    if (!quantity || parseFloat(String(quantity)) <= 0) {
      alert("Quantity must be greater than zero.");
      return;
    }

    if (quantityError) {
      alert("Quantity must be greater than zero.");
      return;
    }

    try {
      await api.patch(`/admin/stock-in/${stock.stock_in_id}`, {
        stock_qty: Number(quantity),
        variant: stock.variant,
      });
      if (onSuccess) onSuccess();
      onClose();
      setConfirm(false);
    } catch (error: any) {
      alert("Error updating stock: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white w-[520px] rounded-xl overflow-hidden">
          <div className="bg-red-800 text-white px-6 py-4 text-lg font-bold">Stock In</div>

          <div className="p-6 space-y-4">
            <div className="flex gap-4">
              <img src={stock.product_image} alt="" className="w-28 h-28 object-cover rounded-lg border" />
              <div className="flex-1">
                <h3 className="font-bold text-lg">{stock.product_name}</h3>
                <p className="text-xs text-gray-500 mt-1">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                <p className="text-red-700 font-bold mt-2">₱{stock.cost}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm font-semibold">Edit Quantity</label>
                <input
                  type="number"
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                  value={quantity}
                  min="1"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || parseFloat(value) >= 0) {
                      setQuantity(value);
                      const numValue = parseFloat(value);
                      if (value && numValue <= 0) {
                        setQuantityError("Quantity must be greater than zero.");
                      } else {
                        setQuantityError("");
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e" || e.key === "E") {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => {
                    const pastedData = e.clipboardData.getData("text");
                    if (parseFloat(pastedData) < 0) {
                      e.preventDefault();
                    }
                  }}
                />
                {quantityError && <p className="text-red-600 text-xs mt-1">{quantityError}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold">Variation</label>
                <input
                  type="text"
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
                  value={stock.variant}
                  readOnly
                  disabled
                />
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-6">
              <button
                onClick={() => setConfirm(true)}
                className="bg-red-800 hover:bg-red-900 text-white px-10 py-2 rounded-full text-sm font-semibold hover:cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={onClose}
                className="border border-red-700 text-red-700 px-10 py-2 rounded-full text-sm font-semibold hover:cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {confirm && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <div className="fixed inset-0 flex items-center justify-center z-60">
            <div className="bg-white w-[360px] rounded-xl p-6 text-center space-y-4">
              <p className="font-semibold">Are you sure you want to make changes in stock?</p>

              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="bg-red-800 text-white px-8 py-2 rounded-full text-sm"
                >
                  Yes
                </button>
                <button
                  onClick={() => setConfirm(false)}
                  className="border border-red-700 text-red-700 px-8 py-2 rounded-full text-sm"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
