import { useState, useEffect } from "react";
import api from "../services/api";

interface InventoryLog {
  id: number;
  created_at: string;
  item_name: string;
  type: string;
  quantity: number;
  total: number;
  admin_action: string;
}

export const useInventoryLogs = () => {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [allLogs, setAllLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/inventory-logs", {
        params: {
          search: query,
          type: typeFilter,
          page: currentPage,
          per_page: perPage,
        },
      });
      const logData = response.data;
      setLogs(logData.data || []);
      setTotalPages(logData.last_page || 1);
    } catch (error) {
      console.error("Error fetching inventory logs:", error);
      setLogs([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLogs = async () => {
    try {
      const response = await api.get("/admin/inventory-logs", {
        params: { per_page: 10000 },
      });
      setAllLogs(response.data.data || []);
    } catch (error) {
      console.error("Error fetching all logs:", error);
      setAllLogs([]);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, typeFilter, query]);

  useEffect(() => {
    fetchAllLogs();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      "Stock In": "bg-green-100 text-green-800",
      "Stock Out": "bg-red-100 text-red-800",
      "Add Product": "bg-blue-100 text-blue-800",
      "Edit Product": "bg-yellow-100 text-yellow-800",
      "Delete Product": "bg-gray-100 text-gray-800",
      Archived: "bg-orange-100 text-orange-800",
      Restored: "bg-purple-100 text-purple-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return {
    logs,
    allLogs,
    loading,
    query,
    setQuery,
    typeFilter,
    setTypeFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    perPage,
    fetchLogs,
    fetchAllLogs,
    formatDate,
    getTypeBadgeColor,
  };
};
