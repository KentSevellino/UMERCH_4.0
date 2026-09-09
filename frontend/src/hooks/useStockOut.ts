import { useState, useEffect } from "react";
import api from "../services/api";

interface StockLog {
  id: number;
  date_time: string;
  product_name: string;
  variant: string;
  quantity: number;
  reason: string;
  modified_by: string;
}

interface Stock {
  stock_in_id: number;
  stock_qty: number;
  product_name: string;
}

export const useStockOut = () => {
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchStocks = async () => {
    try {
      const res = await api.get("/admin/stock-in");
      setStocks(res.data);
    } catch (err) {
      console.error("Failed to fetch stocks", err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await api.get("/admin/stock-out/logs");
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to fetch stock-out logs", err);
    }
  };

  useEffect(() => {
    fetchStocks();
    fetchLogs();

    const interval = setInterval(() => {
      fetchStocks();
      fetchLogs();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.product_name?.toLowerCase().includes(query) ||
      log.variant?.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return {
    logs: paginatedLogs,
    allLogs: logs,
    stocks,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    fetchStocks,
    fetchLogs,
  };
};
