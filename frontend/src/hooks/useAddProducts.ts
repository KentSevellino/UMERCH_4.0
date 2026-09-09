import { useState, useEffect } from "react";
import api from "../services/api";

interface Product {
  product_id: number;
  product_name: string;
  product_price: number;
  product_image: string;
  variant_type: string;
  status: string;
}

const PLACEHOLDER_IMG = "../../assets/images/product-placeholder.svg";

export const useAddProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [toast, setToast] = useState("");
  const [showingToast, setShowingToast] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const normalizeImageUrl = (u: string) => {
    if (!u) return PLACEHOLDER_IMG;
    if (u.startsWith("http")) return u;
    if (u.startsWith("/")) return u;
    return "/" + u;
  };

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

  const fetchProducts = async () => {
    try {
      const res = await api.get("/admin/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    setShowingToast(true);
    setTimeout(() => setShowingToast(false), 5000);
  };

  const toggleExpanded = (productName: string) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productName]: !prev[productName],
    }));
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      fetchProducts();
      showToast("Product deleted successfully!");
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleArchive = async (id: number) => {
    try {
      const response = await api.patch(`/admin/products/${id}/archive`);
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.product_id === id ? { ...product, status: "archived" } : product
        )
      );
      showToast("Product archived successfully!");
      await fetchProducts();
    } catch (error: any) {
      console.error("Archive failed", error);
      if (error.response?.data?.error === "pending_orders_exist") {
        showToast("Cannot archive this product. There are pending orders containing this item.");
      } else {
        showToast(error.response?.data?.message || "Failed to archive product");
      }
      await fetchProducts();
    }
  };

  const handleRestore = async (id: number) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.product_id === id ? { ...product, status: "active" } : product
      )
    );
    showToast("Product restored successfully!");
    try {
      await api.patch(`/admin/products/${id}/restore`);
      await fetchProducts();
    } catch (error) {
      console.error("Restore failed", error);
      await fetchProducts();
    }
  };

  const getFilteredAndGroupedProducts = () => {
    const groupedProducts = groupProductsByName(products);
    const filteredProducts = Object.entries(groupedProducts).filter(([productName]) => {
      if (!productName) return false;
      return productName.toLowerCase().includes(searchQuery.toLowerCase());
    });
    return filteredProducts;
  };

  const getPaginatedProducts = () => {
    const filteredProducts = getFilteredAndGroupedProducts();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(getFilteredAndGroupedProducts().length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return {
    products,
    openAdd,
    setOpenAdd,
    openEdit,
    setOpenEdit,
    selectedProduct,
    setSelectedProduct,
    openDelete,
    setOpenDelete,
    toast,
    showingToast,
    expandedProducts,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    normalizeImageUrl,
    groupProductsByName,
    fetchProducts,
    showToast,
    toggleExpanded,
    handleDelete,
    handleArchive,
    handleRestore,
    getPaginatedProducts,
    getFilteredAndGroupedProducts,
  };
};
