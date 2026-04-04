import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import ProductCard from '../../components/ProductCard';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Search, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

const Menu = () => {
  // Read table from URL query first, fall back to sessionStorage (survives refresh)
  const urlTable = new URLSearchParams(window.location.search).get('table');
  const [table, setTable] = useState(() => urlTable || sessionStorage.getItem('assignedTable') || null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const { cart, total } = useCart();
  const navigate = useNavigate();

  // When a QR link brings a table param, persist it for the whole session
  useEffect(() => {
    if (urlTable) {
      sessionStorage.setItem('assignedTable', urlTable);
      setTable(urlTable);
    }
  }, [urlTable]);

  const [wasOccupied, setWasOccupied] = useState(false);

  // Periodically check if our assigned table has been freed by the cashier
  useEffect(() => {
    const myTable = sessionStorage.getItem('assignedTable');
    if (!myTable) return;

    const check = () => {
      api.get('/api/v1/table')
        .then(({ data }) => {
          const t = data.find(t => String(t.tableNumber) === String(myTable));
          if (t) {
            if (t.isOccupied) {
              setWasOccupied(true);
            } else if (wasOccupied) {
              // Only clear if it WAS occupied and now it is NOT (freed by cashier)
              sessionStorage.removeItem('assignedTable');
              setTable(null);
              toast('Your session has ended. Table has been cleared.', {
                icon: '🔔',
                duration: 5000,
              });
            }
          }
        })
        .catch(() => {});
    };

    const iv = setInterval(check, 15000); // check every 15s
    return () => clearInterval(iv);
  }, [wasOccupied]);

  // Fetch menu AFTER page load (not on QR scan)
  useEffect(() => {
    api.get('/api/v1/product')
      .then(({ data }) => setProducts(data))
      .catch(() => toast.error('Failed to load menu'))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...new Set(products.map((p) => p.category).filter(Boolean))];

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && p.isAvailable !== false;
  });

  const totalItems = cart.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <Layout>
      <div className="flex flex-col h-full overflow-hidden slide-in">
        {/* ── Top Bar ── */}
        <div className="bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 pt-4 pb-3 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Menu</h1>
              {table ? (
                <div className="flex items-center gap-1 text-xs text-indigo-400 mt-0.5">
                  <QrCode size={11} />
                  <span>Table {table}</span>
                </div>
              ) : (
                <p className="text-xs text-slate-500 mt-0.5">Browse our menu</p>
              )}
            </div>
            <button
              onClick={() => navigate(`/menu/cart${table ? `?table=${table}` : ''}`)}
              className="relative flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95"
            >
              <ShoppingCart size={16} />
              Cart
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-lg">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Product Grid ── */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-24">
              <Spinner size="lg" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-600 gap-3">
              <div className="text-5xl">🔍</div>
              <p className="text-sm">No items found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>

        {/* ── Sticky Cart Bar ── */}
        {totalItems > 0 && (
          <div className="shrink-0 px-4 pb-4 pt-3 bg-slate-900 border-t border-slate-800">
            <button
              onClick={() => navigate(`/menu/cart${table ? `?table=${table}` : ''}`)}
              className="w-full flex items-center justify-between bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white px-5 py-3.5 rounded-2xl font-semibold transition-all shadow-lg shadow-indigo-500/20"
            >
              <span className="bg-white/20 text-sm px-2.5 py-0.5 rounded-full">{totalItems} item{totalItems > 1 ? 's' : ''}</span>
              <span>View Cart →</span>
              <span className="font-bold">₹{total.toFixed(2)}</span>
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Menu;
