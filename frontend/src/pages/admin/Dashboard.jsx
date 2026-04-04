import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import { TrendingUp, ShoppingBag, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className={`glass rounded-2xl p-5 border-l-4 ${color} card-hover`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-slate-400 text-sm">{label}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
      <div className={`p-2.5 rounded-xl bg-slate-800`}>
        <Icon size={22} className="text-indigo-400" />
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/v1/order')
      .then(({ data }) => setOrders(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((acc, o) => acc + o.totalAmount, 0);
  const pending = orders.filter(o => o.paymentStatus === 'pending').length;
  const completed = orders.filter(o => o.status === 'completed').length;

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    preparing: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-green-500/20 text-green-400',
  };
  const payColors = {
    pending: 'bg-red-500/20 text-red-400',
    paid: 'bg-green-500/20 text-green-400',
  };

  return (
    <Layout>
      <div className="p-6 space-y-6 slide-in">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">Overview of your cafeteria operations</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard label="Total Orders" value={orders.length} icon={ShoppingBag} color="border-indigo-500" />
              <StatCard label="Revenue" value={`₹${totalRevenue.toFixed(2)}`} icon={DollarSign} color="border-emerald-500" sub="Paid orders only" />
              <StatCard label="Pending Payment" value={pending} icon={Clock} color="border-yellow-500" />
              <StatCard label="Completed" value={completed} icon={CheckCircle} color="border-green-500" />
            </div>

            {/* Recent Orders */}
            <div className="glass rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-white mb-4">Recent Orders</h2>
              {recentOrders.length === 0 ? (
                <div className="text-center py-10 text-slate-500">No orders yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        {['Order #', 'Table', 'Items', 'Total', 'Status', 'Payment', 'Time'].map(h => (
                          <th key={h} className="pb-3 text-left text-slate-400 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {recentOrders.map((o) => (
                        <tr key={o._id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 text-indigo-400 font-mono text-xs">{o.orderNumber}</td>
                          <td className="py-3 text-slate-300">T{o.tableNumber}</td>
                          <td className="py-3 text-slate-300">{o.items?.length}</td>
                          <td className="py-3 text-white font-medium">₹{o.totalAmount?.toFixed(2)}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[o.status]}`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${payColors[o.paymentStatus]}`}>
                              {o.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3 text-slate-500 text-xs">
                            {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
