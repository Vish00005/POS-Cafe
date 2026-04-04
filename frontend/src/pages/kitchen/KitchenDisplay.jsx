import { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import Layout from "../../components/Layout";
import { ChefHat, Clock, CheckCircle, Flame, RefreshCw } from "lucide-react";
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
  const intervalRef = useRef(null);

  const fetchOrders = async () => {
    try {
      // Only fetch paid orders — cash orders don't appear until cashier confirms payment
      const { data } = await api.get("/api/v1/order?paymentStatus=paid");
      // Active orders first, then last 5 completed
      const active = data.filter((o) => o.status !== "completed");
      const done = data.filter((o) => o.status === "completed").slice(0, 5);
      setOrders([...active, ...done]);
      setLastRefresh(new Date());
    } catch (_) {}
  };

  useEffect(() => {
    fetchOrders();
    intervalRef.current = setInterval(fetchOrders, 3000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await api.put(`/api/v1/order/${orderId}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o)),
      );
      if (status === "completed") toast.success("Order marked as ready! 🎉");
      else toast.success(`Order moved to ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setUpdating(null);
    }
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
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
              <ChefHat size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Kitchen Display</h1>
              <p className="text-slate-400 text-xs">
                {activeCount} active order{activeCount !== 1 ? "s" : ""} ·
                Auto-refresh every 3s
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <RefreshCw
              size={12}
              className="animate-spin"
              style={{ animationDuration: "3s" }}
            />
            {lastRefresh.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
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
                          {order.items?.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-slate-700 rounded-md flex items-center justify-center text-xs font-bold text-white">
                                {item.quantity}
                              </div>
                              <span className="text-sm text-white">
                                {item.name}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Action button */}
                        {cfg.next && (
                          <button
                            onClick={() => updateStatus(order._id, cfg.next)}
                            disabled={updating === order._id}
                            className={`w-full ${cfg.btnColor} disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg transition-all`}
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
