import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import { CreditCard, Banknote, Smartphone, CheckCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentScreen = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payMethod, setPayMethod] = useState('cash');
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/v1/order')
      .then(({ data }) => {
        const found = data.find(o => o._id === id);
        if (found) setOrder(found);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handlePayment = async () => {
    setProcessing(true);
    try {
      await api.put(`/api/v1/order/${id}/payment`, {
        paymentStatus: 'paid',
      });
      setPaid(true);
      toast.success('Payment successful!');
      setTimeout(() => navigate('/pos'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const methods = [
    { id: 'cash', label: 'Cash', icon: Banknote, color: 'emerald' },
    { id: 'upi', label: 'UPI', icon: Smartphone, color: 'indigo' },
    { id: 'card', label: 'Card', icon: CreditCard, color: 'purple' },
  ];

  if (loading) return <Layout><div className="flex justify-center py-32"><Spinner size="lg" /></div></Layout>;
  if (!order) return <Layout><div className="p-6 text-slate-400">Order not found.</div></Layout>;

  return (
    <Layout>
      <div className="p-6 max-w-lg mx-auto slide-in">
        <button onClick={() => navigate('/pos')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm transition-colors">
          <ArrowLeft size={16} /> Back to Floor
        </button>

        {paid ? (
          <div className="glass rounded-2xl p-10 text-center space-y-4">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={40} className="text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Payment Complete!</h2>
            <p className="text-slate-400">Order {order.orderNumber} has been paid.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-white">Payment</h1>
              <p className="text-slate-400 text-sm">Order {order.orderNumber} — Table {order.tableNumber}</p>
            </div>

            {/* Order summary */}
            <div className="glass rounded-2xl p-5 space-y-3">
              <h2 className="font-semibold text-white">Order Items</h2>
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-300">{item.name} <span className="text-slate-500">×{item.quantity}</span></span>
                  <span className="text-white font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-slate-700 pt-3 flex justify-between">
                <span className="font-bold text-white text-lg">Total</span>
                <span className="font-bold text-indigo-400 text-lg">₹{order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment method */}
            <div className="glass rounded-2xl p-5 space-y-4">
              <h2 className="font-semibold text-white">Select Payment Method</h2>
              <div className="grid grid-cols-3 gap-3">
                {methods.map(({ id: mId, label, icon: Icon }) => (
                  <button
                    key={mId}
                    onClick={() => setPayMethod(mId)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${payMethod === mId ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}
                  >
                    <Icon size={22} />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-lg"
              >
                {processing ? 'Processing...' : `Collect ₹${order.totalAmount?.toFixed(2)}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PaymentScreen;
