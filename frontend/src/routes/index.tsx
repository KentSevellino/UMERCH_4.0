import { Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from '../components/guards/AuthGuard';
import AdminGuard from '../components/guards/AdminGuard';

// Lazy load pages
import LoginPage from '../Pages/LoginPage';
import ProductsPage from '../Pages/ProductsPage';
import AboutUsPage from '../Pages/AboutUsPage';
import AuthenticationPage from '../Pages/AuthenticationPage';
import LandingPage from '../Pages/LandingPage';
import ShopPage from '../Pages/ShopPage';
import CartPage from '../Pages/CartPage';
import CheckoutPage from '../Pages/CheckoutPage';
import OrdersPage from '../Pages/OrdersPage';
import ToPayPage from '../Pages/ToPayPage';
import ToReceivePage from '../Pages/ToReceivePage';
import CompletedPage from '../Pages/CompletedPage';
import CancelledPage from '../Pages/CancelledPage';
import DashboardPage from '../Pages/admin/DashboardPage';
import AddProductsPage from '../Pages/admin/AddProductsPage';
import StockInPage from '../Pages/admin/StockInPage';
import StockOutPage from '../Pages/admin/StockOutPage';
import InventoryReportPage from '../Pages/admin/InventoryReportPage';
import TransactionPage from '../Pages/admin/TransactionPage';
import UserLogsPage from '../Pages/admin/UserLogsPage';
import InventoryLogsPage from '../Pages/admin/InventoryLogsPage';
import ActivityLogsPage from '../Pages/admin/ActivityLogsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root goes to Landing */}
      <Route path="/" element={<Navigate to="/Landing" replace />} />

      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/Products" element={<ProductsPage />} />
      <Route path="/AboutUs" element={<AboutUsPage />} />

      {/* Auth Routes */}
      <Route path="/authentication" element={<AuthGuard><AuthenticationPage /></AuthGuard>} />
      <Route path="/Landing" element={<AuthGuard><LandingPage /></AuthGuard>} />
      <Route path="/Shop" element={<AuthGuard><ShopPage /></AuthGuard>} />
      <Route path="/Cart" element={<AuthGuard><CartPage /></AuthGuard>} />
      <Route path="/Checkout" element={<AuthGuard><CheckoutPage /></AuthGuard>} />
      <Route path="/Orders" element={<AuthGuard><OrdersPage /></AuthGuard>} />
      <Route path="/ToPay" element={<AuthGuard><ToPayPage /></AuthGuard>} />
      <Route path="/ToReceive" element={<AuthGuard><ToReceivePage /></AuthGuard>} />
      <Route path="/Completed" element={<AuthGuard><CompletedPage /></AuthGuard>} />
      <Route path="/Cancelled" element={<AuthGuard><CancelledPage /></AuthGuard>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminGuard><DashboardPage /></AdminGuard>} />
      <Route path="/admin/inventory/add" element={<AdminGuard><AddProductsPage /></AdminGuard>} />
      <Route path="/admin/inventory/stock-in" element={<AdminGuard><StockInPage /></AdminGuard>} />
      <Route path="/admin/inventory/stock-out" element={<AdminGuard><StockOutPage /></AdminGuard>} />
      <Route path="/admin/inventory/report" element={<AdminGuard><InventoryReportPage /></AdminGuard>} />
      <Route path="/admin/transaction" element={<AdminGuard><TransactionPage /></AdminGuard>} />
      <Route path="/admin/record-logs/user" element={<AdminGuard><UserLogsPage /></AdminGuard>} />
      <Route path="/admin/record-logs/inventory" element={<AdminGuard><InventoryLogsPage /></AdminGuard>} />
      <Route path="/admin/record-logs/activity" element={<AdminGuard><ActivityLogsPage /></AdminGuard>} />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
