import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import ProductCard from "../../components/ProductCard";
import { useCart } from "../../context/CartContext";
import { ShoppingCart, Search, QrCode, ClipboardList } from "lucide-react";
import toast from "react-hot-toast";

const Menu = () => {
  const urlTable = new URLSearchParams(window.location.search).get("table");
  const [table, setTable] = useState(
    () => urlTable || sessionStorage.getItem("assignedTable") || null,
  );

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const { cart, total } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (urlTable) {
      sessionStorage.setItem("assignedTable", urlTable);
      setTable(urlTable);
    }
  }, [urlTable]);

  const [wasOccupied, setWasOccupied] = useState(false);
  const missedCheckCount = useRef(0);

  useEffect(() => {
    const myTable = sessionStorage.getItem("assignedTable");
    if (!myTable) return;

    const check = () => {
      api
        .get("/api/v1/table")
        .then(({ data }) => {
          const t = data.find((t) => String(t.tableNumber) === String(myTable));
          if (t) {
            if (t.isOccupied) {
              setWasOccupied(true);
              missedCheckCount.current = 0; // Reset grace period
            } else if (wasOccupied) {
              // Table was occupied, now it is not.
              // We use a grace period (2 checks = ~30s) to avoid accidental kicks
              missedCheckCount.current += 1;
              if (missedCheckCount.current >= 2) {
                sessionStorage.removeItem("assignedTable");
                setTable(null);
                setWasOccupied(false);
                toast("Your session has ended. Table has been cleared.", {
                  icon: "🔔",
                  duration: 6000,
                });
              }
            }
          }
        })
        .catch(() => {});
    };

    const iv = setInterval(check, 15000);
    return () => clearInterval(iv);
  }, [wasOccupied]);

  useEffect(() => {
    api
      .get("/api/v1/product")
      .then(({ data }) => setProducts(data))
      .catch(() => toast.error("Failed to load menu"))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    "All",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && p.isAvailable !== false;
  });

  const totalItems = cart.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <Layout>
      <div className="flex flex-col h-full overflow-hidden bg-slate-950">
        {/* ── Top Bar ── */}
        <div className="bg-slate-900/40 backdrop-blur-xl border-b border-white/5 px-4 pt-5 pb-4 space-y-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">MENU</h1>
                {table && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    LIVE SESSION
                  </div>
                )}
              </div>
              {table ? (
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <QrCode size={12} className="text-indigo-400" />
                  <span>Table {table}</span>
                </div>
              ) : (
                <p className="text-xs font-medium text-slate-500 tracking-wide">BROWSING CATALOG</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/menu/orders")}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all active:scale-95 border border-white/5"
                title="My Orders"
              >
                <ClipboardList size={20} />
              </button>
              <button
                onClick={() =>
                  navigate(`/menu/cart${table ? `?table=${table}` : ""}`)
                }
                className="relative flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 shadow-lg shadow-indigo-500/10"
              >
                <ShoppingCart size={16} />
                Cart
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-lg ring-2 ring-slate-900">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
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
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "bg-slate-800 text-slate-400 hover:text-white"
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
              onClick={() =>
                navigate(`/menu/cart${table ? `?table=${table}` : ""}`)
              }
              className="w-full flex items-center justify-between bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white px-5 py-3.5 rounded-2xl font-semibold transition-all shadow-lg shadow-indigo-500/20"
            >
              <span className="bg-white/20 text-sm px-2.5 py-0.5 rounded-full">
                {totalItems} item{totalItems > 1 ? "s" : ""}
              </span>
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
