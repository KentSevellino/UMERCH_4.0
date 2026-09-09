import { useState, useEffect } from "react";
import api from "../services/api";

interface ActivityLog {
  activity_logs_id: number;
  action: string;
  description: string;
  created_at: string;
}

export const useActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [allLogs, setAllLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activityFilter, setActivityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/activity-logs", {
        params: {
          search: query,
          activity: activityFilter,
          page: currentPage,
          per_page: perPage,
        },
      });
      setLogs(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLogs = async () => {
    try {
      const response = await api.get("/admin/activity-logs", {
        params: { per_page: 10000 },
      });
      setAllLogs(response.data.data);
    } catch (error) {
      console.error("Error fetching all logs:", error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, activityFilter, query]);

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

  const getActivityBadgeColor = (action: string) => {
    const colors: Record<string, string> = {
      Login: "bg-green-100 text-green-800",
      Logout: "bg-red-100 text-red-800",
    };
    return colors[action] || "bg-gray-100 text-gray-800";
  };

  return {
    logs,
    allLogs,
    loading,
    query,
    setQuery,
    activityFilter,
    setActivityFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    perPage,
    fetchLogs,
    fetchAllLogs,
    formatDate,
    getActivityBadgeColor,
  };
};
