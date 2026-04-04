import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import { Users, Mail, Shield, Search, ShoppingBag, IndianRupee } from 'lucide-react';

const roleBadge = {
  admin:    'bg-purple-500/20 text-purple-400',
  cashier:  'bg-blue-500/20 text-blue-400',
  kitchen:  'bg-orange-500/20 text-orange-400',
  customer: 'bg-slate-700 text-slate-400',
};

const Staff = () => {
  const [users, setUsers]     = useState([]);
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/api/v1/auth/users'),
      api.get('/api/v1/order'),
    ])
      .then(([u, o]) => { setUsers(u.data); setOrders(o.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Pre-compute per-customer stats from orders
  const customerStats = useMemo(() => {
    const map = {};
    orders.forEach(o => {
      const id = o.customer?._id || o.customer;
      if (!id) return;
      if (!map[id]) map[id] = { count: 0, revenue: 0 };
      map[id].count   += 1;
      map[id].revenue += o.totalAmount || 0;
    });
    return map;
  }, [orders]);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const staff     = filtered.filter(u => u.role !== 'customer');
  const customers = filtered.filter(u => u.role === 'customer');

  // Sort customers by revenue desc
  const sortedCustomers = [...customers].sort((a, b) =>
    (customerStats[b._id]?.revenue || 0) - (customerStats[a._id]?.revenue || 0)
  );

  const totalCustomerRevenue = customers.reduce(
    (s, u) => s + (customerStats[u._id]?.revenue || 0), 0
  );

  return (
    <Layout>
      <div className="p-6 space-y-5 slide-in">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-white">Staff & Users</h1>
            <p className="text-sm text-slate-400">
              {staff.length} staff · {customers.length} customers ·{' '}
              <span className="text-emerald-400 font-medium">₹{totalCustomerRevenue.toFixed(2)} total spend</span>
            </p>
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name or email…"
              className="bg-slate-800 border border-slate-700 text-white pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <>
            {/* ── Staff section ── */}
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Staff Members</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {staff.map(u => (
                  <div key={u._id} className="glass rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate">{u.name}</div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 truncate">
                        <Mail size={10} />{u.email}
                      </div>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-1 font-medium ${roleBadge[u.role]}`}>
                        <Shield size={10} />{u.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Customers section ── */}
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Registered Customers
              </h2>
              <div className="glass rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-800">
                    <tr className="text-left text-slate-400 text-xs uppercase tracking-wider">
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3 text-center">Orders</th>
                      <th className="px-4 py-3 text-right">Total Spend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {sortedCustomers.map(u => {
                      const stats = customerStats[u._id] || { count: 0, revenue: 0 };
                      return (
                        <tr key={u._id} className="hover:bg-slate-800/40 transition-colors group">
                          {/* Avatar + name */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-white font-medium">{u.name}</span>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="px-4 py-3 text-slate-400">{u.email}</td>

                          {/* Order count */}
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-400">
                              <ShoppingBag size={11} />
                              {stats.count}
                            </span>
                          </td>

                          {/* Revenue */}
                          <td className="px-4 py-3 text-right">
                            {stats.revenue > 0 ? (
                              <span className="inline-flex items-center gap-0.5 font-bold text-emerald-400">
                                <IndianRupee size={12} />
                                {stats.revenue.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-slate-600 text-xs">No orders</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                  {/* Footer totals */}
                  {sortedCustomers.length > 0 && (
                    <tfoot className="border-t border-slate-700">
                      <tr className="bg-slate-800/40">
                        <td colSpan={2} className="px-4 py-3 text-xs font-semibold text-slate-400">
                          {customers.length} customer{customers.length !== 1 ? 's' : ''}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-400">
                            <ShoppingBag size={11} />
                            {customers.reduce((s, u) => s + (customerStats[u._id]?.count || 0), 0)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center gap-0.5 font-black text-emerald-400 text-base">
                            <IndianRupee size={14} />
                            {totalCustomerRevenue.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>

                {sortedCustomers.length === 0 && (
                  <div className="text-center py-8 text-slate-600 text-sm">No customers registered yet</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Staff;
