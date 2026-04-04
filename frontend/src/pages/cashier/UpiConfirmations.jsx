import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import { CheckCircle, XCircle, RefreshCw, Smartphone, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const UpiConfirmations = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null); // order id being processed

  const fetchPending = () => {
    api.get('/api/v1/order?paymentStatus=upi_pending')
      .then(({ data }) => setOrders(data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPending();
    const iv = setInterval(fetchPending, 8000);
    return () => clearInterval(iv);
  }, []);

  const handle = async (orderId, action) => {
    setActing(orderId);
    try {
      await api.put(`/api/v1/order/${orderId}/upi-confirm`, { action });
      if (action === 'approve') {
        toast.success('✅ UPI Confirmed — order sent to kitchen!');
      } else {
        toast.error('❌ UPI Rejected — order discarded');
      }
      fetchPending();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setActing(null);
    }
  };

  const elapsed = (createdAt) => {
    const m = Math.floor((Date.now() - new Date(createdAt)) / 60000);
    return m < 1 ? 'Just now' : `${m}m ago`;
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6 space-y-5 slide-in">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center">
                <Smartphone size={18} className="text-white" />
              </div>
              <h1 className="text-2xl font-black text-white">UPI Confirmations</h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              {orders.length} order{orders.length !== 1 ? 's' : ''} awaiting payment confirmation · auto-refreshes every 8s
            </p>
          </div>
          <button onClick={fetchPending} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300">
            <RefreshCw size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : orders.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center space-y-3">
            <div className="text-5xl">✅</div>
            <h3 className="text-white font-semibold">All clear!</h3>
            <p className="text-slate-500 text-sm">No UPI payments waiting for confirmation</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map(order => (
              <div key={order._id} className="glass rounded-2xl p-5 border-2 border-purple-500/30 space-y-4">
                {/* Order info */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-mono font-bold text-indigo-400 text-sm">{order.orderNumber}</div>
                    <div className="text-xs text-slate-400">Table {order.tableNumber}</div>
                    {order.customer && (
                      <div className="text-xs text-slate-500 mt-0.5">{order.customer.name}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-white">₹{order.totalAmount}</div>
                    <div className="flex items-center gap-1 text-xs text-yellow-400 justify-end">
                      <Clock size={10} /> {elapsed(order.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-slate-800/60 rounded-xl p-3 space-y-1.5 text-sm">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-slate-300">
                      <span>{item.name} <span className="text-slate-500">×{item.quantity}</span></span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Instructions for cashier */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-3 py-2 text-xs text-yellow-400">
                  📱 Ask customer to show UPI payment confirmation screenshot before approving.
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handle(order._id, 'reject')}
                    disabled={acting === order._id}
                    className="flex items-center justify-center gap-1.5 bg-red-600/20 hover:bg-red-600 border border-red-500/40 hover:border-red-600 text-red-400 hover:text-white py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                  >
                    <XCircle size={15} /> Reject
                  </button>
                  <button
                    onClick={() => handle(order._id, 'approve')}
                    disabled={acting === order._id}
                    className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle size={15} /> {acting === order._id ? 'Processing...' : 'Confirm Paid'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UpiConfirmations;
