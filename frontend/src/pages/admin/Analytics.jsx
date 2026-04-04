import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';
import { IndianRupee, ShoppingBag, TrendingUp, Users, AlertCircle } from 'lucide-react';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899'];

const Analytics = () => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    api.get('/api/v1/order/analytics')
      .then(({ data }) => setData(data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout>
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    </Layout>
  );

  if (error || !data) return (
    <Layout>
      <div className="p-6 flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
          <AlertCircle size={28} className="text-red-400" />
        </div>
        <h2 className="text-white font-semibold">Could not load analytics</h2>
        <p className="text-slate-500 text-sm text-center max-w-sm">{error || 'No data returned from server'}</p>
        <button
          onClick={() => { setError(null); setLoading(true); api.get('/api/v1/order/analytics').then(({ data }) => setData(data)).catch(e => setError(e.message)).finally(() => setLoading(false)); }}
          className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
        >
          Try again →
        </button>
      </div>
    </Layout>
  );

  // Safe destructure with defaults so nothing can throw
  const {
    revenueByDay    = [],
    statusBreakdown = [],
    paymentBreakdown = [],
    totalOrders     = 0,
    totalRevenue    = 0,
  } = data;

  const avgOrder = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

  // Filter out zero-value slices in pie charts to prevent recharts crash
  const payBreakdownFiltered = paymentBreakdown.filter(p => p.value > 0);

  return (
    <Layout>
      <div className="p-6 space-y-6 slide-in">
        <div>
          <h1 className="text-2xl font-black text-white">Analytics</h1>
          <p className="text-slate-400 text-sm mt-0.5">7-day performance overview</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: ShoppingBag, label: 'Total Orders',    value: totalOrders,              color: 'indigo' },
            { icon: IndianRupee, label: 'Total Revenue',   value: `₹${totalRevenue.toFixed(0)}`, color: 'emerald' },
            { icon: TrendingUp,  label: 'Avg Order Value', value: `₹${avgOrder.toFixed(0)}`,color: 'purple' },
            { icon: Users,       label: "Today's Orders",  value: revenueByDay[6]?.orders ?? 0, color: 'yellow' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="glass rounded-2xl p-5">
              <div className={`w-10 h-10 mb-3 rounded-xl bg-${color}-500/20 flex items-center justify-center`}>
                <Icon size={18} className={`text-${color}-400`} />
              </div>
              <div className="text-2xl font-black text-white">{value}</div>
              <div className="text-xs text-slate-400 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Revenue trend */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Daily Revenue Trend</h2>
          {revenueByDay.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-600 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueByDay}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#f1f5f9' }} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#grad1)" name="Revenue (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders per day bar */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Orders Per Day</h2>
            {revenueByDay.length === 0 ? (
              <div className="flex items-center justify-center h-36 text-slate-600 text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenueByDay} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#f1f5f9' }} />
                  <Bar dataKey="orders" radius={[6, 6, 0, 0]} fill="#6366f1" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Payment methods pie */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Payment Methods</h2>
            {payBreakdownFiltered.length === 0 ? (
              <div className="flex items-center justify-center h-36 text-slate-600 text-sm">No paid orders yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={payBreakdownFiltered}
                    dataKey="value"
                    cx="50%" cy="50%"
                    outerRadius={75}
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {payBreakdownFiltered.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend formatter={v => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#f1f5f9' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
