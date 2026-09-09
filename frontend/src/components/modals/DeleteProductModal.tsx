import React, { useState } from "react";
import { api } from "../../services/api";

interface DeleteProductModalProps {
  open: boolean;
  onClose: () => void;
  product: { product_id: number | string } | null;
  onDeleted?: () => void;
  onShowToast?: (message: string, type: string) => void;
}

export default function DeleteProductModal({ open, onClose, product, onDeleted, onShowToast }: DeleteProductModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!open || !product) return null;

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const response = await api.delete(`/admin/products/${product.product_id}`);
      if (response.data?.success) {
        if (onDeleted) onDeleted();
      } else {
        if (onShowToast) onShowToast(response.data?.message || "Failed to delete product", "error");
      }
    } catch (error: any) {
      if (onShowToast) onShowToast("An error occurred while deleting the product", "error");
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center backdrop-blur-xs bg-black/5"
      onClick={onClose}
    >
      <div
        className="bg-[#F6F6F6] shadow-lg relative w-130 h-40 rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center justify-center p-10">
          <h1 className="text-center font-semibold text-lg mb-2">Are you sure you want to remove this product?</h1>
          <div className="flex flex-row gap-3">
            <button
              type="button"
              disabled={isLoading}
              className="flex justify-center items-center bg-[#9C0306] text-white text-[16px] font-semibold w-30 h-10 rounded-[5px] hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleDelete}
            >
              {isLoading ? "Deleting..." : "Yes"}
            </button>
            <button
              type="button"
              disabled={isLoading}
              className="flex justify-center items-center bg-white text-[#9C0306] text-[16px] font-semibold border border-[#9C0306] w-30 h-10 rounded-[5px] hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
