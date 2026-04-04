import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';
import { IndianRupee, ShoppingBag, TrendingUp, Users } from 'lucide-react';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/v1/order/analytics')
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><div className="flex justify-center items-center h-screen"><Spinner size="lg" /></div></Layout>;
  if (!data) return null;

  const { revenueByDay, statusBreakdown, paymentBreakdown, totalOrders, totalRevenue } = data;

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
            { icon: ShoppingBag,  label: 'Total Orders',   value: totalOrders,                     color: 'indigo' },
            { icon: IndianRupee,  label: 'Total Revenue',  value: `₹${totalRevenue.toFixed(0)}`,   color: 'emerald' },
            { icon: TrendingUp,   label: 'Avg Order Value',value: totalOrders ? `₹${(totalRevenue/totalOrders).toFixed(0)}` : '₹0', color: 'purple' },
            { icon: Users,        label: 'Today',          value: revenueByDay[6]?.orders || 0,    color: 'yellow' },
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders per day */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Orders Per Day</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueByDay} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#f1f5f9' }} />
                <Bar dataKey="orders" radius={[6, 6, 0, 0]} fill="#6366f1" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Payment methods */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Payment Methods</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={paymentBreakdown} dataKey="value" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}>
                  {paymentBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#f1f5f9' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
