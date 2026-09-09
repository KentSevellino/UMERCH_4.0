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

interface AddStockOutModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const reasonOptions = [
  { value: "defected", label: "Defected" },
  { value: "damaged", label: "Damaged" },
  { value: "return", label: "Return" },
  { value: "adjustment", label: "Adjustment" },
];

export default function AddStockOutModal({ open, onClose, onSuccess }: AddStockOutModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [variantOptions, setVariantOptions] = useState<string[]>([]);
  const [variation, setVariation] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("defected");
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

    const submitData = {
      product_id: selected.product_id,
      quantity: Number(quantity),
      reason: reason,
      modified_by: "Admin",
    };

    setIsSubmitting(true);
    try {
      await api.post("/admin/stock-out", submitData);
      if (onSuccess) onSuccess();
      onClose();
      setConfirm(false);
      setProductId("");
      setVariation("");
      setQuantity("");
      setReason("defected");
    } catch (error: any) {
      alert("Error removing stock: " + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const grouped = groupProductsByName(products);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40" />}

      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      >
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          <div className="bg-red-700 text-white px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-bold">Remove Stock</h2>
            <button onClick={onClose} className="text-xl leading-none hover:opacity-70">
              ✕
            </button>
          </div>

          {!confirm ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setConfirm(true);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product <span className="text-red-600">*</span>
                </label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700"
                  required
                >
                  <option value="">Select a product</option>
                  {Object.keys(grouped).map((productName) => (
                    <option key={productName} value={productName}>
                      {productName}
                    </option>
                  ))}
                </select>
              </div>

              {variantOptions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variant <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={variation}
                    onChange={(e) => handleVariantChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700"
                    required
                  >
                    <option value="">Select variant</option>
                    {variantOptions.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const value = e.target.value;
                    setQuantity(value);
                    if (parseFloat(value) <= 0) {
                      setQuantityError("Quantity must be greater than zero");
                    } else {
                      setQuantityError("");
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    quantityError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-700"
                  }`}
                  placeholder="0"
                  required
                />
                {quantityError && <p className="text-red-600 text-xs mt-1">{quantityError}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason <span className="text-red-600">*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700"
                  required
                >
                  {reasonOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-medium disabled:opacity-50"
                  disabled={!productId || !quantity || quantityError !== ""}
                >
                  Confirm
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-semibold mb-2">Confirm Stock Removal</p>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Product:</span> {productId}
                    {variation && <span> ({variation})</span>}
                  </p>
                  <p>
                    <span className="font-medium">Quantity:</span> {quantity}
                  </p>
                  <p>
                    <span className="font-medium">Reason:</span> {reasonOptions.find((r) => r.value === reason)?.label}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Are you sure you want to remove {quantity} unit(s) of {productId} from stock?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {isSubmitting ? "Removing..." : "Remove Stock"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
