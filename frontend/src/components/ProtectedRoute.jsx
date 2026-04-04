import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleRedirects = {
  admin: "/admin",
  cashier: "/pos",
  kitchen: "/kitchen",
  customer: "/menu",
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    const intended = window.location.pathname + window.location.search;
    if (intended !== "/login") {
      sessionStorage.setItem("redirectAfterLogin", intended);
    }
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleRedirects[user.role] || "/login"} replace />;
  }

  return children;
};

export default ProtectedRoute;
