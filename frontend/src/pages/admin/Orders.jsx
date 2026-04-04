import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/api/v1/order')
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o =>
    filter === 'paid' ? o.paymentStatus === 'paid' : o.paymentStatus === 'pending'
  );

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
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">All Orders</h1>
            <p className="text-slate-400 text-sm">{filtered.length} orders</p>
          </div>
          <div className="flex gap-2">
            {['all', 'paid', 'pending'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${filter === f ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/50">
                  <tr>
                    {['Order #', 'Table', 'Customer', 'Items', 'Total', 'Status', 'Payment', 'Method', 'Date'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-slate-400 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filtered.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 text-indigo-400 font-mono text-xs">{o.orderNumber}</td>
                      <td className="px-4 py-3 text-slate-300">T{o.tableNumber}</td>
                      <td className="px-4 py-3 text-slate-300">{o.customer?.name || '—'}</td>
                      <td className="px-4 py-3 text-slate-300">
                        <div className="space-y-0.5">
                          {o.items?.slice(0, 2).map((item, i) => (
                            <div key={i} className="text-xs">{item.name} ×{item.quantity}</div>
                          ))}
                          {o.items?.length > 2 && <div className="text-xs text-slate-500">+{o.items.length - 2} more</div>}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">₹{o.totalAmount?.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[o.status]}`}>{o.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${payColors[o.paymentStatus]}`}>{o.paymentStatus}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 capitalize text-xs">{o.paymentMethod || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(o.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-16 text-slate-500">No orders found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminOrders;
