import { useState, useEffect } from "react";
import api from "../services/api";

interface User {
  id?: number;
  um_id?: number;
  userId?: number;
  user_id?: number;
  ID?: number;
  user_fullname?: string;
  name?: string;
  fullname?: string;
  email?: string;
  user_email?: string;
  role?: string;
  status?: string;
  user_status?: string;
}

export const useUserLogs = () => {
  const [query, setQuery] = useState("");
  const [isAddUsersOpen, setAddUsersOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("success");
  const [showingToast, setShowingToast] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionModalOpen, setActionModalOpen] = useState<number | null>(null);
  const itemsPerPage = 10;

  const fetchUsers = async () => {
    try {
      const response = await api.get("/admin/users");
      const data = response.data;
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setUsers(list);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (message: string, type = "success") => {
    setToast(message);
    setToastType(type);
    setShowingToast(true);
    setTimeout(() => setShowingToast(false), 5000);
  };

  const openAddUsersModal = () => setAddUsersOpen(true);
  const closeAddUsersModal = () => setAddUsersOpen(false);

  const handleUserAdded = (user?: User) => {
    const name = user && (user.user_fullname || user.name) ? user.user_fullname || user.name : null;
    showToast(name ? `User ${name} added successfully!` : "User added successfully!");
    setAddUsersOpen(false);
    fetchUsers();
  };

  const openUpdateModal = (user: User) => {
    setSelectedUser(user);
    setEditOpen(true);
  };

  const closeEditModal = () => {
    setEditOpen(false);
    setSelectedUser(null);
  };

  const handleUpdateSuccess = () => {
    showToast("User updated successfully!");
    fetchUsers();
    closeEditModal();
  };

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteSuccess = () => {
    showToast("User deleted successfully!", "success");
    fetchUsers();
    closeDeleteModal();
  };

  const handleDeleteError = (message: string) => {
    showToast(message || "Failed to delete user. Please try again.", "error");
    closeDeleteModal();
  };

  const handleReactivate = async (user: User) => {
    const userId = user.id || user.um_id || user.userId || user.user_id;
    try {
      await api.patch(`/admin/reactivate-user/${userId}`);
      showToast("User reactivated successfully!");
      fetchUsers();
    } catch (error: any) {
      console.error("Error reactivating user:", error);
      showToast(error.response?.data?.error || "Failed to reactivate user. Please try again.");
    }
  };

  const handleDeactivate = async (user: User) => {
    const userId = user.id || user.um_id || user.userId || user.user_id;
    try {
      await api.patch(`/admin/deactivate-user/${userId}`);
      showToast("User deactivated successfully!");
      fetchUsers();
    } catch (error: any) {
      console.error("Error deactivating user:", error);
      showToast(error.response?.data?.error || "Failed to deactivate user. Please try again.");
    }
  };

  const filterUsers = (userList: User[], q: string) => {
    return userList.filter((userRaw) => {
      if (userRaw.role === "Admin") return false;
      if (userRaw.email === "admin@umerch.com") return false;
      if (!q.trim()) return true;
      const searchLower = q.toLowerCase();
      const email = (userRaw.email || userRaw.user_email || "").toLowerCase();
      const userId = (userRaw.um_id || userRaw.userId || userRaw.user_id || "").toString().toLowerCase();
      return email.includes(searchLower) || userId.includes(searchLower);
    });
  };

  const getPaginatedUsers = (userList: User[], page: number, perPage: number) => {
    const startIndex = (page - 1) * perPage;
    return userList.slice(startIndex, startIndex + perPage);
  };

  const getTotalPages = (userList: User[], perPage: number) => {
    return Math.ceil(userList.length / perPage);
  };

  const goToPage = (page: number, total: number) => {
    if (page >= 1 && page <= total) {
      setCurrentPage(page);
    }
  };

  const mapUser = (userRaw: User) => ({
    id: userRaw.id || userRaw.um_id || userRaw.userId || userRaw.user_id || userRaw.ID || 0,
    user_fullname: userRaw.user_fullname || userRaw.name || userRaw.fullname || "",
    um_id: userRaw.um_id || userRaw.userId || userRaw.user_id || 0,
    email: userRaw.email || userRaw.user_email || "",
    status: userRaw.status || userRaw.user_status || "active",
  });

  return {
    query,
    setQuery,
    isAddUsersOpen,
    users,
    loading,
    toast,
    toastType,
    showingToast,
    isEditOpen,
    selectedUser,
    isDeleteOpen,
    userToDelete,
    currentPage,
    setCurrentPage,
    actionModalOpen,
    setActionModalOpen,
    itemsPerPage,
    fetchUsers,
    showToast,
    openAddUsersModal,
    closeAddUsersModal,
    handleUserAdded,
    openUpdateModal,
    closeEditModal,
    handleUpdateSuccess,
    openDeleteModal,
    closeDeleteModal,
    handleDeleteSuccess,
    handleDeleteError,
    handleReactivate,
    handleDeactivate,
    filterUsers,
    getPaginatedUsers,
    getTotalPages,
    goToPage,
    mapUser,
  };
};
