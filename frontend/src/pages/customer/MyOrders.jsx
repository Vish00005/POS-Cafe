import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Clock, ChefHat, CheckCircle, Banknote, Smartphone, CreditCard, RefreshCw, AlertCircle, Star } from 'lucide-react';
import RatingModal from '../../components/RatingModal';

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'bg-yellow-500/20 text-yellow-400',
    border: 'border-yellow-500/30',
    bar: 1,
  },
  preparing: {
    label: 'Preparing',
    icon: ChefHat,
    color: 'bg-blue-500/20 text-blue-400',
    border: 'border-blue-500/30',
    bar: 2,
  },
  completed: {
    label: 'Ready / Completed',
    icon: CheckCircle,
    color: 'bg-green-500/20 text-green-400',
    border: 'border-green-500/30',
    bar: 3,
  },
};

const paymentIcons = {
  cash: Banknote,
  upi: Smartphone,
  card: CreditCard,
};

const paymentStatusColor = {
  pending: 'bg-red-500/20 text-red-400',
  paid: 'bg-green-500/20 text-green-400',
};

const ProgressBar = ({ status }) => {
  const steps = ['pending', 'preparing', 'completed'];
  const current = steps.indexOf(status);
  return (
    <div className="flex items-center gap-1 mt-3">
      {steps.map((step, i) => {
        const cfg = statusConfig[step];
        const active = i <= current;
        const Icon = cfg.icon;
        return (
          <div key={step} className="flex items-center flex-1">
            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-all ${active ? cfg.color : 'bg-slate-800 text-slate-600'}`}>
              <Icon size={10} />
              <span className="hidden sm:inline">{cfg.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${i < current ? 'bg-indigo-500' : 'bg-slate-700'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [ratingOrder, setRatingOrder] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    api.get(`/api/v1/order?customer=${user._id}`)
      .then(({ data }) => setOrders(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    // Poll for status updates every 10s
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const filters = [
    { key: 'all', label: 'All Orders' },
    { key: 'pending', label: 'Pending' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'completed', label: 'Completed' },
  ];

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const getTimeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    const hrs = Math.floor(diff / 60);
    return `${hrs}h ago`;
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6 space-y-5 slide-in">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">My Orders</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {orders.length} order{orders.length !== 1 ? 's' : ''} placed by you
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filter === f.key
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
              {f.key !== 'all' && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({orders.filter(o => o.status === f.key).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag size={36} className="text-slate-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">No orders yet</h2>
              <p className="text-slate-400 text-sm mt-1">Your orders will appear here once placed.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => {
              const cfg = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = cfg.icon;
              const PayIcon = paymentIcons[order.paymentMethod] || Banknote;

              return (
                <div
                  key={order._id}
                  className={`glass rounded-2xl border ${cfg.border} overflow-hidden card-hover`}
                >
                  {/* Order header */}
                  <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.color}`}>
                        <StatusIcon size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-white font-mono text-sm">{order.orderNumber}</div>
                        <div className="text-xs text-slate-400">
                          Table {order.tableNumber} · {getTimeAgo(order.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-white">₹{order.totalAmount?.toFixed(2)}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="px-4 py-3 space-y-1.5">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-slate-300">
                          {item.name}
                          <span className="text-slate-500 ml-1.5">×{item.quantity}</span>
                        </span>
                        <span className="text-white font-medium">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer — payment info + progress */}
                  <div className="px-4 pb-4 space-y-3">
                    {/* Payment badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1 text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-full">
                        <PayIcon size={11} />
                        {order.paymentMethod?.toUpperCase() || 'CASH'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${paymentStatusColor[order.paymentStatus]}`}>
                        {order.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Payment Pending'}
                      </span>
                      {order.paymentStatus === 'pending' && order.paymentMethod === 'cash' && (
                        <span className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded-full">
                          💵 Pay at counter
                        </span>
                      )}
                    </div>

                    {/* Progress tracker */}
                    <ProgressBar status={order.status} />

                    {/* Rate Order Button */}
                    {order.status === 'completed' && !order.reviewedAt && (
                      <button
                        onClick={() => setRatingOrder(order)}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white py-2.5 rounded-xl text-xs font-bold transition-all border border-indigo-500/20 active:scale-95 mt-4"
                      >
                        <Star size={14} fill="currentColor" />
                        RATE YOUR ORDER
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rating Modal */}
        {ratingOrder && (
          <RatingModal
            order={ratingOrder}
            onClose={() => setRatingOrder(null)}
            onSuccess={fetchOrders}
          />
        )}

        {/* Auto-refresh notice */}
        <div className="flex items-center gap-2 text-xs text-slate-600 justify-center pb-2">
          <RefreshCw size={10} className="animate-spin" style={{ animationDuration: '10s' }} />
          Auto-refreshes every 10 seconds
        </div>
      </div>
    </Layout>
  );
};

export default MyOrders;
