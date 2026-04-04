import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Landing from "./pages/Landing";

// Admin
import AdminDashboard from "./pages/admin/Dashboard";
import ProductsManagement from "./pages/admin/Products";
import TablesManagement from "./pages/admin/Tables";
import AdminOrders from "./pages/admin/Orders";
import AdminStaff from "./pages/admin/Staff";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminSettings from "./pages/admin/Settings";

// Cashier
import FloorView from "./pages/cashier/FloorView";
import OrderScreen from "./pages/cashier/OrderScreen";
import PaymentScreen from "./pages/cashier/PaymentScreen";
import CashPayments from "./pages/cashier/CashPayments";
import UpiConfirmations from "./pages/cashier/UpiConfirmations";

// Kitchen
import KitchenDisplay from "./pages/kitchen/KitchenDisplay";

// Customer
import Menu from "./pages/customer/Menu";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import MyOrders from "./pages/customer/MyOrders";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: "#1e293b", color: "#f1f5f9", border: "1px solid #334155" },
              success: { iconTheme: { primary: "#22c55e", secondary: "#f1f5f9" } },
              error:   { iconTheme: { primary: "#ef4444", secondary: "#f1f5f9" } },
            }}
          />
          <Routes>
            {/* Public */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/"         element={<Landing />} />

            {/* ── Admin ── */}
            {[
              { path: "/admin",            element: <AdminDashboard /> },
              { path: "/admin/orders",     element: <AdminOrders /> },
              { path: "/admin/products",   element: <ProductsManagement /> },
              { path: "/admin/tables",     element: <TablesManagement /> },
              { path: "/admin/staff",      element: <AdminStaff /> },
              { path: "/admin/analytics",  element: <AdminAnalytics /> },
              { path: "/admin/settings",   element: <AdminSettings /> },
            ].map(({ path, element }) => (
              <Route key={path} path={path} element={
                <ProtectedRoute allowedRoles={["admin"]}>{element}</ProtectedRoute>
              } />
            ))}

            {/* ── Cashier ── */}
            {[
              { path: "/pos",          element: <FloorView /> },
              { path: "/pos/order",    element: <OrderScreen /> },
              { path: "/pos/payment/:id", element: <PaymentScreen /> },
              { path: "/pos/cash",     element: <CashPayments /> },
              { path: "/pos/upi",      element: <UpiConfirmations /> },
            ].map(({ path, element }) => (
              <Route key={path} path={path} element={
                <ProtectedRoute allowedRoles={["cashier", "admin"]}>{element}</ProtectedRoute>
              } />
            ))}

            {/* ── Kitchen ── */}
            <Route path="/kitchen" element={
              <ProtectedRoute allowedRoles={["kitchen", "admin"]}><KitchenDisplay /></ProtectedRoute>
            } />

            {/* ── Customer ── */}
            {/* ── Customer (Public/Browse) ── */}
            <Route path="/menu" element={<Menu />} />

            {/* ── Customer (Protected) ── */}
            {[
              { path: "/menu/cart",      element: <Cart /> },
              { path: "/menu/checkout",  element: <Checkout /> },
              { path: "/menu/orders",    element: <MyOrders /> },
            ].map(({ path, element }) => (
              <Route key={path} path={path} element={
                <ProtectedRoute allowedRoles={["customer", "admin"]}>{element}</ProtectedRoute>
              } />
            ))}

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
