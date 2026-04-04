import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Send,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const OrderScreen = () => {
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get("table") || 1;
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/api/v1/product")
      .then(({ data }) => setProducts(data))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    "All",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];
  const filtered =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const addToCart = (product) => {
    setCart((prev) => {
      const ex = prev.find((i) => i._id === product._id);
      if (ex)
        return prev.map((i) =>
          i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) => {
      const updated = prev.map((i) =>
        i._id === id ? { ...i, quantity: i.quantity + delta } : i,
      );
      return updated.filter((i) => i.quantity > 0);
    });
  };

  const total = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const placeOrder = async () => {
    if (cart.length === 0) return toast.error("Cart is empty");
    setPlacing(true);
    try {
      const items = cart.map((i) => ({
        productId: i._id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      }));
      const { data } = await api.post("/api/v1/order", {
        tableNumber: parseInt(tableNumber),
        items,
        paymentMethod: "cash",
        customer: user._id,
      });
      toast.success(`Order ${data.orderNumber} placed!`);
      navigate(`/pos/payment/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Layout>
      <div className="flex h-screen overflow-hidden slide-in">
        {/* Products panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-slate-800">
            <button
              onClick={() => navigate("/pos")}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">
                New Order — Table {tableNumber}
              </h1>
              <p className="text-xs text-slate-400">
                Select items to add to order
              </p>
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 px-4 py-3 overflow-x-auto border-b border-slate-800">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filtered.map((p) => {
                  const inCart = cart.find((i) => i._id === p._id);
                  return (
                    <button
                      key={p._id}
                      onClick={() => addToCart(p)}
                      className={`glass rounded-xl p-3 text-left hover:border-indigo-500/50 transition-all border-2 ${inCart ? "border-indigo-500" : "border-transparent"}`}
                    >
                      <img
                        src={
                          p.img ||
                          "https://cdn-icons-png.flaticon.com/128/8633/8633559.png"
                        }
                        alt={p.name}
                        className="w-full h-20 object-contain mb-2"
                        onError={(e) => {
                          e.target.src =
                            "https://cdn-icons-png.flaticon.com/128/8633/8633559.png";
                        }}
                      />
                      <div className="text-sm font-medium text-white truncate">
                        {p.name}
                      </div>
                      <div className="text-xs text-slate-400">{p.category}</div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-indigo-400">
                          ₹{p.price}
                        </span>
                        {inCart && (
                          <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                            ×{inCart.quantity}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Cart sidebar */}
        <div className="w-80 border-l border-slate-800 flex flex-col bg-slate-900">
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-indigo-400" />
              <h2 className="font-semibold text-white">Order Summary</h2>
              <span className="ml-auto bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                {cart.length}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-3">
                <ShoppingBag size={40} />
                <p className="text-sm">No items added</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 bg-slate-800 rounded-xl p-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      ₹{item.price} each
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(item._id, -1)}
                      className="w-6 h-6 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center justify-center text-sm"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-7 text-center text-sm text-white font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item._id, 1)}
                      className="w-6 h-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center justify-center text-sm"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-slate-800 space-y-3">
            <div className="flex justify-between text-lg font-bold text-white">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <button
              onClick={placeOrder}
              disabled={cart.length === 0 || placing}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
            >
              <Send size={16} />
              {placing ? "Placing..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderScreen;
