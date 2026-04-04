import { useState, useEffect, useRef, useCallback } from "react";
import api from "../../services/api";
import Layout from "../../components/Layout";
import {
  ChefHat,
  Clock,
  CheckCircle,
  Flame,
  RefreshCw,
  Bell,
  BellOff,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

const statusConfig = {
  pending: {
    label: "Pending",
    next: "preparing",
    nextLabel: "Start Cooking",
    color: "border-red-500",
    badge: "bg-red-500/20 text-red-400",
    btnColor: "bg-orange-600 hover:bg-orange-500",
    icon: Clock,
  },
  preparing: {
    label: "Preparing",
    next: "completed",
    nextLabel: "Mark Ready",
    color: "border-orange-500",
    badge: "bg-orange-500/20 text-orange-400",
    btnColor: "bg-green-600 hover:bg-green-500",
    icon: Flame,
  },
  completed: {
    label: "Completed",
    next: null,
    nextLabel: null,
    color: "border-green-500",
    badge: "bg-green-500/20 text-green-400",
    btnColor: "",
    icon: CheckCircle,
  },
};

const KitchenDisplay = () => {
  const [orders, setOrders] = useState([]);
  const [updating, setUpdating] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [newOrderId, setNewOrderId] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioEnabledRef = useRef(false);
  const knownOrderIds = useRef(new Set());
  const [checkedItems, setCheckedItems] = useState(() => {
    const saved = localStorage.getItem("kitchen_checked_items");
    return saved ? JSON.parse(saved) : {};
  });
  const audioRef = useRef(new Audio("/mixkit-correct-answer-reward-952.wav"));

  // Save checked items to localStorage
  useEffect(() => {
    localStorage.setItem("kitchen_checked_items", JSON.stringify(checkedItems));
  }, [checkedItems]);

  // Toggle audio and store in ref
  const toggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    audioEnabledRef.current = next;
    if (next) {
      audioRef.current.play().catch(() => {});
      toast.success("Audio alerts enabled! 🔔");
    }
  };

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await api.get("/api/v1/order?paymentStatus=paid");

      // ── New Order Detection ──
      let detectedOrder = null;
      if (knownOrderIds.current.size > 0) {
        // Find if any fetched order is NOT in our known set
        for (const order of data) {
          if (!knownOrderIds.current.has(order._id)) {
            detectedOrder = order;
            break; // Just need the first new one to trigger sound
          }
        }
      }

      // Sync known IDs (add all fetched IDs to the set)
      data.forEach((o) => knownOrderIds.current.add(o._id));

      // If new order found, trigger notification
      if (detectedOrder) {
        setNewOrderId(detectedOrder._id);

        if (audioEnabledRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current
            .play()
            .catch((e) => console.log("🔇 Sound blocked:", e));
        }

        toast.custom(
          (t) => (
            <div
              className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full bg-slate-900 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-indigo-500 border border-indigo-500/50 p-4`}
            >
              <div className="flex-1 w-0">
                <div className="flex items-start">
                  <div className="shrink-0 pt-0.5">
                    <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                      <Bell className="text-white" size={20} />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-bold text-white">
                      New Order #{detectedOrder.orderNumber}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Table {detectedOrder.tableNumber} just placed an order!
                    </p>
                  </div>
                </div>
              </div>
              <div className="ml-4 shrink-0 flex">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="px-3 py-1 text-xs font-bold text-indigo-400"
                >
                  Close
                </button>
              </div>
            </div>
          ),
          { duration: 8000 },
        );

        setTimeout(() => setNewOrderId(null), 15000);
      }

      const active = data.filter((o) => o.status !== "completed");
      const done = data.filter((o) => o.status === "completed").slice(0, 5);
      setOrders([...active, ...done]);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("❌ Fetch failed:", err);
    }
  }, []);

  // Polling setup (3 seconds)
  useEffect(() => {
    fetchOrders();
    const iv = setInterval(fetchOrders, 3000);
    return () => clearInterval(iv);
  }, [fetchOrders]);

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await api.put(`/api/v1/order/${orderId}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o)),
      );
      if (status === "completed") {
        setCheckedItems((prev) => {
          const next = { ...prev };
          delete next[orderId];
          return next;
        });
        toast.success("Order marked as ready! 🎉");
      } else toast.success(`Order moved to ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setUpdating(null);
    }
  };

  const toggleItem = (orderId, itemIndex) => {
    setCheckedItems((prev) => {
      const orderChecked = { ...prev[orderId] };
      orderChecked[itemIndex] = !orderChecked[itemIndex];
      return { ...prev, [orderId]: orderChecked };
    });
  };

  const isOrderReady = (order) => {
    if (order.status !== "preparing") return true;
    const items = order.items || [];
    const checked = checkedItems[order._id] || {};
    return items.every((_, i) => checked[i]);
  };

  const getElapsed = (createdAt) => {
    const diff = Math.floor((Date.now() - new Date(createdAt)) / 60000);
    return diff < 1 ? "Just now" : `${diff}m ago`;
  };

  const activeCount = orders.filter((o) => o.status !== "completed").length;

  return (
    <Layout>
      <div className="p-4 space-y-4 slide-in">
        {/* KDS Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <ChefHat size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Kitchen Display</h1>
              <p className="text-slate-400 text-xs">
                {activeCount} active order{activeCount !== 1 ? "s" : ""} ·
                Real-time alerts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Audio Toggle */}
            <button
              onClick={toggleAudio}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all ${
                audioEnabled
                  ? "bg-indigo-600/20 border-indigo-600 text-indigo-400"
                  : "bg-slate-800 border-slate-700 text-slate-500"
              }`}
              title={audioEnabled ? "Disable Sound" : "Enable Sound"}
            >
              {audioEnabled ? (
                <Bell size={16} className="animate-pulse" />
              ) : (
                <BellOff size={16} />
              )}
              <span className="text-xs font-bold hidden sm:inline">
                {audioEnabled ? "ALERTS ON" : "ALERTS OFF"}
              </span>
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <RefreshCw
                size={12}
                className="animate-spin text-slate-600"
                style={{ animationDuration: "30s" }}
              />
              {lastRefresh.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>
          </div>
        </div>

        {/* Column tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["pending", "preparing", "completed"].map((status) => {
            const cfg = statusConfig[status];
            const Icon = cfg.icon;
            const statusOrders = orders.filter((o) => o.status === status);

            return (
              <div key={status} className="space-y-3">
                {/* Column header */}
                <div
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 ${cfg.color} bg-slate-900`}
                >
                  <Icon size={16} className={cfg.badge.split(" ")[1]} />
                  <span className="font-semibold text-white capitalize">
                    {cfg.label}
                  </span>
                  <span
                    className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}
                  >
                    {statusOrders.length}
                  </span>
                </div>

                {/* Orders */}
                <div className="space-y-3">
                  {statusOrders.length === 0 ? (
                    <div className="text-center py-8 text-slate-600 text-sm">
                      {status === "completed"
                        ? "No completed orders"
                        : "No orders here"}
                    </div>
                  ) : (
                    statusOrders.map((order) => (
                      <div
                        key={order._id}
                        className={`glass rounded-xl p-4 border-2 ${cfg.color} ${status === "pending" ? "order-pending" : ""} space-y-3`}
                      >
                        {/* Order header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-bold text-white text-sm font-mono">
                              {order.orderNumber}
                            </div>
                            <div className="text-xs text-slate-400">
                              Table {order.tableNumber}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-slate-500">
                              {getElapsed(order.createdAt)}
                            </div>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}
                            >
                              {cfg.label}
                            </span>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-1.5">
                          {order.items?.map((item, i) => {
                            const isChecked = !!(checkedItems[order._id]?.[i]);
                            const showCheckbox = status === "preparing";

                            return (
                              <div
                                key={i}
                                className={`flex items-center gap-2 group transition-all ${isChecked ? "opacity-40" : ""}`}
                              >
                                {showCheckbox ? (
                                  <button
                                    onClick={() => toggleItem(order._id, i)}
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isChecked ? "bg-indigo-600 border-indigo-600" : "border-slate-600 hover:border-indigo-400"}`}
                                  >
                                    {isChecked && <Check size={12} className="text-white" />}
                                  </button>
                                ) : (
                                  <div className="w-6 h-6 bg-slate-700 rounded-md flex items-center justify-center text-xs font-bold text-white">
                                    {item.quantity}
                                  </div>
                                )}
                                <span
                                  className={`text-sm text-white ${isChecked ? "line-through text-slate-500" : ""}`}
                                >
                                  {showCheckbox && (
                                    <span className="text-xs font-bold text-slate-500 mr-2">
                                      {item.quantity}x
                                    </span>
                                  )}
                                  {item.name}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Action button */}
                        {cfg.next && (
                          <button
                            onClick={() => updateStatus(order._id, cfg.next)}
                            disabled={updating === order._id || !isOrderReady(order)}
                            className={`w-full ${cfg.btnColor} disabled:opacity-20 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-all`}
                          >
                            {updating === order._id
                              ? "Updating..."
                              : cfg.nextLabel}
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default KitchenDisplay;
