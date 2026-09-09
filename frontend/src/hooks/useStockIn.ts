import { useState, useEffect } from "react";
import api from "../services/api";

interface Stock {
  stock_in_id: number;
  product_name: string;
  product_image: string;
  variant: string;
  cost: number;
  stock_qty: number;
}

export const useStockIn = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openRemoveStock, setOpenRemoveStock] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [toast, setToast] = useState("");
  const [showingToast, setShowingToast] = useState(false);
  const [receiptFormOpen, setReceiptFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const openReceiptForm = () => setReceiptFormOpen(true);
  const closeReceiptForm = () => setReceiptFormOpen(false);

  const fetchStocks = async () => {
    try {
      const res = await api.get("/admin/stock-in");
      setStocks(res.data);
    } catch (err) {
      console.error("Failed to fetch stocks", err);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    setShowingToast(true);
    setTimeout(() => setShowingToast(false), 5000);
  };

  const getStatus = (qty: number) => {
    if (qty === 0) return { label: "Out of Stock", color: "text-red-600" };
    if (qty <= 20) return { label: "Low Stock", color: "text-orange-500" };
    return { label: "Active", color: "text-green-600" };
  };

  const filteredStocks = stocks.filter((stock) =>
    stock.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStocks = filteredStocks.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return {
    stocks,
    filteredStocks,
    paginatedStocks,
    searchQuery,
    setSearchQuery,
    openAdd,
    setOpenAdd,
    openEdit,
    setOpenEdit,
    openRemoveStock,
    setOpenRemoveStock,
    selectedStock,
    setSelectedStock,
    toast,
    showingToast,
    receiptFormOpen,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    openReceiptForm,
    closeReceiptForm,
    fetchStocks,
    showToast,
    getStatus,
  };
};
