import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  ShoppingBag,
  Coffee,
  Table2,
  Users,
  BarChart3,
  Settings,
  ClipboardList,
  ChefHat,
  UtensilsCrossed,
  ShoppingCart,
  ListOrdered,
  LogOut,
  ChevronRight,
  Banknote,
  Smartphone,
  Menu as MenuIcon,
  X,
} from "lucide-react";

const roleNav = {
  admin: [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/orders", icon: ShoppingBag, label: "Orders" },
    { to: "/admin/products", icon: Coffee, label: "Menu / Products" },
    { to: "/admin/tables", icon: Table2, label: "Tables" },
    { to: "/admin/staff", icon: Users, label: "Staff" },
    { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    { to: "/admin/settings", icon: Settings, label: "Settings" },
  ],
  cashier: [
    { to: "/pos", icon: Table2, label: "Floor View" },
    { to: "/pos/order", icon: ClipboardList, label: "New Order" },
    { to: "/pos/cash", icon: Banknote, label: "Cash Payments" },
    { to: "/pos/upi", icon: Smartphone, label: "UPI Confirm" },
  ],
  kitchen: [{ to: "/kitchen", icon: ChefHat, label: "Kitchen Display" }],
  customer: [
    { to: "/menu", icon: UtensilsCrossed, label: "Menu" },
    { to: "/menu/cart", icon: ShoppingCart, label: "Cart" },
    { to: "/menu/orders", icon: ListOrdered, label: "My Orders" },
  ],
};

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const navItems = roleNav[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* ── Left Icon Rail ── */}
      <aside
        className={`shrink-0 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 z-40 ${expanded ? "w-56" : "w-16"}`}
      >
        {/* Logo + toggle */}
        <div className="flex items-center h-16 px-3 border-b border-slate-800 gap-3 overflow-hidden">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all"
          >
            {expanded ? <X size={16} /> : <MenuIcon size={16} />}
          </button>
          {expanded && (
            <span className="text-sm font-bold text-white whitespace-nowrap overflow-hidden">
              ☕ Smart Cafeteria
            </span>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 space-y-1 px-2 overflow-y-auto overflow-x-hidden">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={
                to === "/admin" ||
                to === "/pos" ||
                to === "/kitchen" ||
                to === "/menu"
              }
              className={({ isActive }) =>
                `flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all group overflow-hidden whitespace-nowrap ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              {expanded && <span className="text-sm font-medium">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="border-t border-slate-800 p-2 space-y-1 overflow-hidden">
          {expanded && (
            <div className="px-2 py-1.5">
              <div className="text-xs font-semibold text-white truncate">
                {user?.name}
              </div>
              <div className="text-xs text-slate-500 capitalize">
                {user?.role}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all overflow-hidden whitespace-nowrap"
          >
            <LogOut size={18} className="shrink-0" />
            {expanded && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto min-w-0">{children}</main>
    </div>
  );
};

export default AppLayout;
