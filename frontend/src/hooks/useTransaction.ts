import { useState, useEffect, useMemo } from "react";
import api from "../services/api";

interface OrderItem {
  product?: {
    product_image?: string;
    product_name?: string;
  };
  variant?: string;
  quantity?: number;
  price?: number;
}

interface Order {
  order_id: number;
  user_fullname?: string;
  user?: { name?: string };
  order_status?: string;
  order_total?: number;
  receipt_form?: string;
  payment_method?: string;
  fulfillment_method?: string;
  created_at?: string;
  order_items?: OrderItem[];
}

interface StatItem {
  title: string;
  value: number;
}

export const useTransaction = () => {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isPrepareModalOpen, setIsPrepareModalOpen] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [isDeliverModalOpen, setIsDeliverModalOpen] = useState(false);
  const [isReadyForPickupModalOpen, setIsReadyForPickupModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const showToast = (message: string, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get("/admin/orders");
      setOrders(Array.isArray(response.data) ? response.data : response.data?.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderUpdated = async () => {
    await fetchOrders();
    if (selectedOrder) {
      try {
        const response = await api.get("/admin/orders");
        const updated = Array.isArray(response.data) ? response.data : response.data?.data || [];
        const refreshedOrder = updated.find((o: Order) => o.order_id === selectedOrder.order_id);
        if (refreshedOrder) {
          setSelectedOrder(refreshedOrder);
        }
      } catch (error) {
        console.error("Error refreshing selected order:", error);
      }
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchQ = !q || order?.order_id?.toString().toLowerCase().includes(q);
      const matchS = status === "All statuses" || order?.order_status?.toLowerCase() === status.toLowerCase();
      return matchQ && matchS;
    });
  }, [orders, query, status]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filtered.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const stats: StatItem[] = [
    { title: "Completed", value: orders.filter((o) => o.order_status?.toLowerCase() === "completed").length },
    { title: "Pending", value: orders.filter((o) => o.order_status?.toLowerCase() === "pending").length },
    { title: "Processing", value: orders.filter((o) => o.order_status?.toLowerCase() === "processing").length },
    { title: "Out for Delivery", value: orders.filter((o) => o.order_status?.toLowerCase() === "out-of-delivery").length },
    { title: "Cancelled", value: orders.filter((o) => o.order_status?.toLowerCase() === "cancelled").length },
  ];

  return {
    query,
    setQuery,
    status,
    setStatus,
    orders,
    loading,
    selectedOrder,
    setSelectedOrder,
    isModalOpen,
    setIsModalOpen,
    isReceiptModalOpen,
    setIsReceiptModalOpen,
    isPrepareModalOpen,
    setIsPrepareModalOpen,
    isDeclineModalOpen,
    setIsDeclineModalOpen,
    isDeliverModalOpen,
    setIsDeliverModalOpen,
    isReadyForPickupModalOpen,
    setIsReadyForPickupModalOpen,
    toast,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    showToast,
    fetchOrders,
    handleOrderUpdated,
    filtered,
    totalPages,
    startIndex,
    paginatedOrders,
    goToPage,
    stats,
  };
};
