import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import AdminDashboard from "./pages/admin/Dashboard";
import ProductsManagement from "./pages/admin/Products";
import TablesManagement from "./pages/admin/Tables";
import AdminOrders from "./pages/admin/Orders";

import FloorView from "./pages/cashier/FloorView";
import OrderScreen from "./pages/cashier/OrderScreen";
import PaymentScreen from "./pages/cashier/PaymentScreen";
import CashPayments from "./pages/cashier/CashPayments";

import KitchenDisplay from "./pages/kitchen/KitchenDisplay";

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
              style: {
                background: "#1e293b",
                color: "#f1f5f9",
                border: "1px solid #334155",
              },
              success: {
                iconTheme: { primary: "#22c55e", secondary: "#f1f5f9" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#f1f5f9" },
              },
            }}
          />
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ProductsManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tables"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <TablesManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminOrders />
                </ProtectedRoute>
              }
            />

            {/* Cashier */}
            <Route
              path="/pos"
              element={
                <ProtectedRoute allowedRoles={["cashier", "admin"]}>
                  <FloorView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pos/order"
              element={
                <ProtectedRoute allowedRoles={["cashier", "admin"]}>
                  <OrderScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pos/payment/:id"
              element={
                <ProtectedRoute allowedRoles={["cashier", "admin"]}>
                  <PaymentScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pos/cash"
              element={
                <ProtectedRoute allowedRoles={["cashier", "admin"]}>
                  <CashPayments />
                </ProtectedRoute>
              }
            />

            {/* Kitchen */}
            <Route
              path="/kitchen"
              element={
                <ProtectedRoute allowedRoles={["kitchen", "admin"]}>
                  <KitchenDisplay />
                </ProtectedRoute>
              }
            />

            {/* Customer */}
            <Route
              path="/menu"
              element={
                <ProtectedRoute allowedRoles={["customer", "admin"]}>
                  <Menu />
                </ProtectedRoute>
              }
            />
            <Route
              path="/menu/cart"
              element={
                <ProtectedRoute allowedRoles={["customer", "admin"]}>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/menu/checkout"
              element={
                <ProtectedRoute allowedRoles={["customer", "admin"]}>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/menu/orders"
              element={
                <ProtectedRoute allowedRoles={["customer", "admin"]}>
                  <MyOrders />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
