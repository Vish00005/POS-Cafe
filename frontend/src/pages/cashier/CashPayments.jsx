import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import { Banknote, CheckCircle, Clock, RefreshCw, Receipt, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CashPayments = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/api/v1/order?paymentMethod=cash&paymentStatus=pending')
      .then(({ data }) => setOrders(data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const confirmPayment = async (orderId) => {
    setConfirming(orderId);
    try {
      await api.put(`/api/v1/order/${orderId}/payment`, { paymentStatus: 'paid' });
      toast.success('Payment confirmed! 💵');
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      if (selectedOrder?._id === orderId) setSelectedOrder(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm payment');
    } finally {
      setConfirming(null);
    }
  };

  const getElapsed = (createdAt) => {
    const diff = Math.floor((Date.now() - new Date(createdAt)) / 60000);
    return diff < 1 ? 'Just now' : `${diff}m ago`;
  };

  const totalPending = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  return (
    <Layout>
      <div className="p-6 space-y-6 slide-in">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Cash Payments</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {orders.length} order{orders.length !== 1 ? 's' : ''} awaiting cash collection
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Total pending amount */}
            {orders.length > 0 && (
              <div className="glass rounded-xl px-4 py-2 border border-yellow-500/30">
                <span className="text-xs text-slate-400">Total Pending: </span>
                <span className="font-bold text-yellow-400">₹{totalPending.toFixed(2)}</span>
              </div>
            )}
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : orders.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center space-y-4">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={40} className="text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">All Settled!</h2>
              <p className="text-slate-400 text-sm mt-1">No pending cash payments right now.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="glass rounded-2xl overflow-hidden border-2 border-yellow-500/40 hover:border-yellow-500/80 transition-all card-hover"
              >
                {/* Card header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-yellow-500/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                      <Banknote size={20} className="text-yellow-400" />
                    </div>
                    <div>
                      <div className="font-bold text-white font-mono text-sm">{order.orderNumber}</div>
                      <div className="text-xs text-slate-400">Table {order.tableNumber}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-white">₹{order.totalAmount?.toFixed(2)}</div>
                    <div className="flex items-center gap-1 text-xs text-yellow-400 justify-end">
                      <Clock size={11} />
                      {getElapsed(order.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Items list */}
                <div className="p-4 space-y-2">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-300">
                        {item.name}
                        <span className="text-slate-500 ml-1">×{item.quantity}</span>
                      </span>
                      <span className="text-white font-medium">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Status badges + action */}
                <div className="px-4 pb-4 flex items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                      <Banknote size={10} /> Cash
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      order.status === 'completed'
                        ? 'bg-green-500/20 text-green-400'
                        : order.status === 'preparing'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <button
                    onClick={() => confirmPayment(order._id)}
                    disabled={confirming === order._id}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle size={15} />
                    {confirming === order._id ? 'Confirming...' : 'Collect Cash'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary bar */}
        {orders.length > 0 && (
          <div className="glass rounded-xl p-4 flex items-center justify-between border border-slate-700/50">
            <div className="text-sm text-slate-400">
              <span className="text-white font-semibold">{orders.length}</span> orders pending · 
              Total collectible: <span className="text-yellow-400 font-bold"> ₹{totalPending.toFixed(2)}</span>
            </div>
            <button
              onClick={() => {
                if (confirm(`Confirm all ${orders.length} cash payments?`)) {
                  orders.forEach((o) => confirmPayment(o._id));
                }
              }}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all"
            >
              <CheckCircle size={15} />
              Confirm All
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CashPayments;
