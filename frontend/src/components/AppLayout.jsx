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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navItems = roleNav[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeMobile = () => setIsMobileOpen(false);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden font-sans">
      {/* ── Top Navbar (Desktop) ── */}
      <header className="hidden lg:flex fixed top-0 left-0 right-0 h-20 items-center justify-between px-8 bg-slate-900/60 backdrop-blur-2xl border-b border-white/5 z-50">
        {/* Left: Logo */}
        <div
          className="flex items-center gap-3 group cursor-pointer shrink-0"
          onClick={() => navigate("/")}
        >
          <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-transform">
            <Coffee size={22} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black text-white tracking-widest leading-none">
              ODOO CAFETERIA
            </span>
            <span className="text-[10px] text-indigo-400 font-bold tracking-[0.2em] uppercase">
              Premium POS
            </span>
          </div>
        </div>

        <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2  p-1.5  border-white/10 shadow-2xl">
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
                `flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-black transition-all duration-300 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-105"
                    : "text-slate-400 hover:text-white hover:bg-white/10"
                }`
              }
            >
              <Icon size={16} strokeWidth={2.5} />
              <span className="uppercase tracking-tight">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right: User Section */}
        <div className="flex items-center gap-5 shrink-0">
          <div className="flex flex-col items-end mr-1">
            <span className="text-sm font-black text-white leading-none">
              {user?.name}
            </span>
            <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-1">
              {user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-11 h-11 flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-lg hover:shadow-red-500/20 active:scale-90"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* ── Top Bar (Mobile) ── */}
      <header className="lg:hidden flex items-center justify-between h-16 px-5 bg-slate-900/80 backdrop-blur-lg border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-sm shadow-lg shadow-indigo-500/20">
            ☕
          </div>
          <span className="text-base font-black tracking-tighter text-white uppercase">
            ODOO CAFETERIA
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2.5 bg-slate-800 rounded-xl text-slate-400 hover:text-red-400 transition-all"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* ── Main Content Area ── */}
      <main className="flex-1 overflow-y-auto w-full lg:pt-20 pb-20 lg:pb-0">
        <div className="max-w-(--breakpoint-2xl) mx-auto w-full min-h-full">
          {children}
        </div>
      </main>

      {/* ── Bottom Navbar (Mobile Only) ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-2xl border-t border-white/10 flex items-center justify-around px-2 z-50">
        {navItems.slice(0, 5).map(({ to, icon: Icon, label }) => (
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
              `flex flex-col items-center justify-center gap-1 w-16 h-full transition-all duration-300 ${
                isActive ? "text-indigo-400" : "text-slate-500"
              }`
            }
          >
            <div
              className={`p-2 rounded-xl transition-all ${
                location.pathname === to ? "bg-indigo-600/10 scale-110" : ""
              }`}
            >
              <Icon size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter truncate w-full text-center">
              {label.split(" ")[0]}
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AppLayout;
