import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { variantTypesMap } from "../../constants";

interface Product {
  product_id: number | string;
  product_name: string;
  product_price: string | number;
  variant_type: string;
  status: string;
}

interface AddStocksModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddStocksModal({ open, onClose, onSuccess }: AddStocksModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [variantOptions, setVariantOptions] = useState<string[]>([]);
  const [variation, setVariation] = useState("");
  const [quantity, setQuantity] = useState("");
  const [quantityError, setQuantityError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      api.get("/admin/products").then((res) => {
        const activeProducts = (res.data.data || res.data).filter((p: Product) => p.status === "active");
        setProducts(activeProducts);
      });
    }
  }, [open]);

  const groupProductsByName = (productList: Product[]) => {
    const grouped: Record<string, Product[]> = {};
    productList.forEach((product) => {
      if (!grouped[product.product_name]) {
        grouped[product.product_name] = [];
      }
      grouped[product.product_name].push(product);
    });
    return grouped;
  };

  useEffect(() => {
    if (productId) {
      const selectedProduct = products.find((p) => p.product_name === productId && p.status === "active");
      if (selectedProduct && selectedProduct.variant_type) {
        const options = variantTypesMap[selectedProduct.variant_type] || [];
        setVariantOptions(options);
      } else {
        setVariantOptions([]);
      }
      setVariation("");
    } else {
      setVariantOptions([]);
      setVariation("");
    }
  }, [productId, products]);

  const handleVariantChange = (selectedVariant: string) => {
    setVariation(selectedVariant);
  };

  if (!open) return null;

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const selected = products.find((p) => p.product_name === productId && p.status === "active");
    if (!selected) {
      alert("Product not found. Please select a valid product.");
      return;
    }

    if (variantOptions.length > 0 && !variation) {
      alert("Please select a variation.");
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      alert("Quantity must be greater than zero.");
      return;
    }

    if (quantityError) {
      alert("Quantity must be greater than zero.");
      return;
    }

    const finalVariant = variantOptions.length === 0 ? selected.variant_type : variation;
    const derivedCost = Number(selected.product_price);

    if (!derivedCost || isNaN(derivedCost)) {
      alert("Invalid product price. Please select a valid product.");
      return;
    }

    const submitData = {
      product_id: selected.product_id,
      variant: finalVariant,
      stock_qty: Number(quantity),
      cost: derivedCost,
    };

    setIsSubmitting(true);
    try {
      await api.post("/admin/stock-in", submitData);
      if (onSuccess) onSuccess();
      onClose();
      setConfirm(false);
      setProductId("");
      setVariation("");
      setQuantity("");
    } catch (error: any) {
      alert("Error adding stock: " + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const grouped = groupProductsByName(products);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white w-[420px] rounded-xl overflow-hidden">
          <div className="bg-red-800 text-white px-6 py-4 text-lg font-bold">Stock In</div>

          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-semibold">Select Products</label>
              <select
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              >
                <option value="">Select Products</option>
                {Object.keys(grouped).map((productName) => (
                  <option key={productName} value={productName}>
                    {productName}
                  </option>
                ))}
              </select>
            </div>

            {variantOptions.length > 0 && (
              <div>
                <label className="text-sm font-semibold">Variation</label>
                <select
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                  value={variation}
                  onChange={(e) => handleVariantChange(e.target.value)}
                  disabled={!productId}
                >
                  <option value="">Select Variation</option>
                  {variantOptions.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-sm font-semibold">Add Quantity</label>
              <input
                type="number"
                placeholder="Enter Quantity"
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

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-full text-sm border border-red-600 text-red-600 hover:cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setConfirm(true)}
                className="bg-red-800 text-white px-6 py-2 rounded-full text-sm hover:cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {confirm && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <div className="fixed inset-0 flex items-center justify-center z-60">
            <div className="bg-white rounded-xl w-[320px] p-6 text-center space-y-4">
              <p className="font-semibold">Are you sure you want to add a stock?</p>

              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-red-800 text-white px-6 py-2 rounded-full text-sm hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Adding..." : "Yes"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirm(false)}
                  disabled={isSubmitting}
                  className="border border-red-600 text-red-600 px-6 py-2 rounded-full text-sm hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
