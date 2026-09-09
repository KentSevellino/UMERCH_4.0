import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { variantTypesMap } from "../../constants";

interface AddProductModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ProductFormData {
  product_name: string;
  product_price: string;
  product_description: string;
  product_image: File | null;
  variant_type: string;
}

const variantTypes = [
  { id: "size", label: "Size XS-XL", hasVariants: true },
  { id: "mug", label: "Mug", hasVariants: true },
  { id: "tumbler", label: "Tumbler", hasVariants: true },
  { id: "notebook", label: "Notebook", hasVariants: true },
  { id: "pen", label: "Pen", hasVariants: false },
  { id: "umbrella", label: "Umbrella", hasVariants: false },
  { id: "keychain", label: "Keychain", hasVariants: false },
  { id: "totebag", label: "Totebag", hasVariants: false },
  { id: "pillow", label: "Pillow", hasVariants: false },
];

export default function AddProductModal({ isOpen, open, onClose, onSuccess }: AddProductModalProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedVariantType, setSelectedVariantType] = useState("");
  const [priceError, setPriceError] = useState("");
  const [formError, setFormError] = useState("");
  const [imageError, setImageError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [data, setData] = useState<ProductFormData>({
    product_name: "",
    product_price: "",
    product_description: "",
    product_image: null,
    variant_type: "",
  });

  const visible = isOpen ?? open;

  useEffect(() => {
    if (!visible) {
      setPreview(null);
      setSelectedVariantType("");
      setPriceError("");
      setFormError("");
      setImageError("");
    }
  }, [visible]);

  const handleVariantTypeChange = (typeId: string) => {
    if (selectedVariantType === typeId) {
      setSelectedVariantType("");
      setData((prev) => ({ ...prev, variant_type: "" }));
    } else {
      setSelectedVariantType(typeId);
      setData((prev) => ({ ...prev, variant_type: typeId }));
    }
  };

  if (!visible) return null;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "product_price") {
      const numValue = parseFloat(value);
      if (value && numValue <= 0) {
        setPriceError("Price must be greater than zero. Please enter a valid price.");
      } else {
        setPriceError("");
      }
    }

    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setData((prev) => ({ ...prev, product_image: file }));
    setPreview(file ? URL.createObjectURL(file) : null);
    if (file) setImageError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!data.product_image) {
      setImageError("Please upload a product image.");
      return;
    }

    if (!selectedVariantType) {
      setFormError("Please select a variant type.");
      return;
    }

    if (priceError) {
      setFormError("Price must be greater than zero. Please enter a valid price.");
      return;
    }

    if (!data.product_price || parseFloat(data.product_price) <= 0) {
      setFormError("Price must be greater than zero. Please enter a valid price.");
      return;
    }

    const formData = new FormData();
    formData.append("product_name", data.product_name);
    formData.append("product_price", data.product_price);
    formData.append("product_description", data.product_description);
    formData.append("variant_type", selectedVariantType);
    formData.append("variant", selectedVariantType);
    if (data.product_image) {
      formData.append("product_image", data.product_image);
    }

    setProcessing(true);
    try {
      await api.post("/admin/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to add product. Please try again.";
      setFormError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-[720px] shadow-2xl rounded-xl overflow-hidden">
        <div className="bg-red-800 px-6 py-4 text-white font-bold text-lg">ADD PRODUCT</div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-semibold mb-2 block">Product Image</label>
            <label className={`border-2 border-dashed rounded-lg h-[180px] flex flex-col items-center justify-center cursor-pointer ${imageError ? "border-red-600 bg-red-50" : "border-red-400"} text-red-600`}>
              <input type="file" className="hidden" onChange={handleFile} accept="image/*" />
              {preview ? (
                <img src={preview} alt="preview" className="h-full object-contain" />
              ) : (
                <>
                  <span className="text-3xl">🖼️</span>
                  <p className="text-sm mt-2">Choose file to upload</p>
                </>
              )}
            </label>
            {imageError && <p className="text-red-600 text-xs mt-1">{imageError}</p>}
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Description:</label>
            <textarea
              placeholder="Add Description"
              name="product_description"
              value={data.product_description}
              onChange={handleInput}
              className="w-full h-[180px] border rounded-lg p-3 text-sm resize-none outline-red-600"
            />
          </div>

          <div className="col-span-2">
            <label className="text-sm font-semibold mb-2 block">Product Name:</label>
            <input
              placeholder="Enter Product Name"
              name="product_name"
              value={data.product_name}
              onChange={handleInput}
              className="w-full border rounded-full px-4 py-2 outline-red-600"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="text-sm font-semibold mb-2 block">Add Price:</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter Price"
              name="product_price"
              value={data.product_price}
              onChange={handleInput}
              className="w-full border rounded-full px-4 py-2 outline-red-600"
              required
            />
            {priceError && <p className="text-red-600 text-xs mt-1">{priceError}</p>}
          </div>

          <div className="col-span-2">
            <label className="text-sm font-semibold mb-2 block">
              Variant Type <span className="text-red-600">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {variantTypes.map((type) => (
                <label key={type.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedVariantType === type.id}
                    onChange={() => handleVariantTypeChange(type.id)}
                    className="w-4 h-4 accent-red-800"
                  />
                  <span className="text-sm">{type.label}</span>
                </label>
              ))}
            </div>
            {!selectedVariantType && <p className="text-red-600 text-xs mt-2">Please select a variant type</p>}
          </div>

          {formError && (
            <div className="col-span-2 bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-2">
              {formError}
            </div>
          )}

          <div className="col-span-2 flex justify-end gap-4">
            <button
              type="submit"
              disabled={processing}
              className="bg-red-800 hover:bg-red-900 text-white px-10 py-2 rounded-full font-semibold hover:cursor-pointer"
            >
              {processing ? "Adding..." : "Add"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="border border-red-700 text-red-700 px-8 py-2 rounded-full font-semibold hover:cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
