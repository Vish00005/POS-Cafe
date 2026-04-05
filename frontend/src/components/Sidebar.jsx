import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, Package, Table2, ShoppingBag, ChefHat, CreditCard, Banknote, ListOrdered } from 'lucide-react';

const navLinks = {
  admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/products', label: 'Menu', icon: Package },
    { to: '/admin/tables', label: 'Tables', icon: Table2 },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  ],
  cashier: [
    { to: '/pos', label: 'Floor View', icon: Table2 },
    { to: '/pos/order', label: 'Parcel', icon: ShoppingBag },
    { to: '/pos/cash', label: 'Cash Payments', icon: Banknote },
  ],
  kitchen: [
    { to: '/kitchen', label: 'Kitchen Display', icon: ChefHat },
  ],
  customer: [
    { to: '/menu', label: 'Menu', icon: ShoppingBag },
    { to: '/menu/orders', label: 'My Orders', icon: ListOrdered },
  ],
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const links = navLinks[user?.role] || [];

  const roleColors = {
    admin: 'from-indigo-600 to-purple-600',
    cashier: 'from-emerald-600 to-teal-600',
    kitchen: 'from-orange-600 to-red-600',
    customer: 'from-blue-600 to-cyan-600',
  };

  const roleLabels = {
    admin: 'Admin Panel',
    cashier: 'POS Terminal',
    kitchen: 'Kitchen Display',
    customer: 'Menu',
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-700/50 flex flex-col shrink-0">
      {/* Logo */}
      <div className={`p-5 bg-linear-to-r ${roleColors[user?.role]} `}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-lg font-bold">
            ☕
          </div>
          <div>
            <div className="font-bold text-white text-sm tracking-widest uppercase">Odoo Cafeteria</div>
            <div className="text-white/70 text-xs">{roleLabels[user?.role]}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-slate-700/50">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-bold uppercase">
            {user?.name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-black text-white tracking-widest leading-none">ODOO CAFETERIA</span>
            <span className="text-[9px] text-indigo-400 font-bold tracking-[0.2em] uppercase">Premium POS</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
