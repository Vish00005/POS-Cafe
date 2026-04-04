import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, ShoppingBag, IndianRupee, Clock, Users, AlertCircle, Star, Award, ThumbsDown } from 'lucide-react';

const COLORS = ['#f59e0b', '#6366f1', '#22c55e', '#ec4899'];

const StatCard = ({ icon: Icon, label, value, sub, color = 'indigo' }) => (
  <div className="glass rounded-2xl p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl bg-${color}-500/20 flex items-center justify-center shrink-0`}>
      <Icon size={22} className={`text-${color}-400`} />
    </div>
    <div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  </div>
);

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/v1/order/analytics'),
      api.get('/api/v1/order?'),
      api.get('/api/v1/review/stats'),
    ])
      .then(([a, o, r]) => {
        setAnalytics(a.data);
        setRecentOrders(o.data.slice(0, 8));
        setReviewStats(r.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><div className="flex justify-center items-center h-screen"><Spinner size="lg" /></div></Layout>;

  const { revenueByDay = [], statusBreakdown = [], paymentBreakdown = [], totalOrders = 0, totalRevenue = 0 } = analytics || {};
  const upiPending = recentOrders.filter(o => o.paymentStatus === 'upi_pending').length;

  return (
    <Layout>
      <div className="p-6 space-y-6 slide-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">Welcome back — here's your cafeteria at a glance</p>
        </div>

        {/* UPI alert */}
        {upiPending > 0 && (
          <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 text-yellow-400">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{upiPending} UPI payment{upiPending > 1 ? 's' : ''} awaiting cashier confirmation</span>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={ShoppingBag}  label="Total Orders"    value={totalOrders}               color="indigo" />
          <StatCard icon={IndianRupee}  label="Revenue (Paid)"  value={`₹${totalRevenue.toFixed(0)}`} color="emerald" />
          <StatCard icon={Clock}        label="UPI Pending"     value={upiPending}                color="yellow" />
          <StatCard icon={TrendingUp}   label="Today's Orders"  value={revenueByDay[6]?.orders || 0} color="purple" />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue area chart */}
          <div className="lg:col-span-2 glass rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Revenue — Last 7 Days</h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueByDay}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#f1f5f9' }} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Status breakdown pie */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Order Status</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusBreakdown} dataKey="value" cx="50%" cy="50%" outerRadius={75} label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''} labelLine={false}>
                  {statusBreakdown.map((e, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#f1f5f9' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment breakdown + Quality Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment bar chart */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Payment Methods</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={paymentBreakdown} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#f1f5f9' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {paymentBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quality Insights */}
          <div className="glass rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Quality Insights (Food Ratings)</h2>
              <Star size={16} className="text-yellow-400" fill="currentColor" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 flex-1">
              {/* Top Rated */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Award size={10} className="text-green-400" /> Top Rated
                </div>
                {reviewStats?.topRated?.length > 0 ? reviewStats.topRated.slice(0, 3).map(p => (
                  <div key={p._id} className="bg-white/5 rounded-xl p-2.5 flex items-center gap-3">
                    <img src={p.img} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{p.name}</div>
                      <div className="flex items-center gap-1 text-[10px] text-yellow-400 font-bold">
                        <Star size={8} fill="currentColor" /> {p.avgRating.toFixed(1)}
                        <span className="text-slate-500 font-normal ml-0.5">({p.totalReviews})</span>
                      </div>
                    </div>
                  </div>
                )) : <div className="text-[10px] text-slate-600 py-4 text-center border border-dashed border-slate-800 rounded-xl">No ratings yet</div>}
              </div>

              {/* Needs Improvement */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <ThumbsDown size={10} className="text-red-400" /> Needs Work
                </div>
                {reviewStats?.lowRated?.length > 0 ? reviewStats.lowRated.slice(0, 3).map(p => (
                  <div key={p._id} className="bg-white/5 rounded-xl p-2.5 flex items-center gap-3">
                    <img src={p.img} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{p.name}</div>
                      <div className="flex items-center gap-1 text-[10px] text-red-400 font-bold">
                        <Star size={8} fill="currentColor" /> {p.avgRating.toFixed(1)}
                        <span className="text-slate-500 font-normal ml-0.5">({p.totalReviews})</span>
                      </div>
                    </div>
                  </div>
                )) : <div className="text-[10px] text-slate-600 py-4 text-center border border-dashed border-slate-800 rounded-xl">No ratings yet</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Recent orders */}
        <div className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Recent Orders</h2>
          <div className="space-y-2">
            {recentOrders.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No orders yet</p>
            ) : recentOrders.map(o => (
              <div key={o._id} className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
                <div>
                  <span className="text-sm font-mono text-indigo-400">{o.orderNumber}</span>
                  <span className="text-xs text-slate-500 ml-2">Table {o.tableNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    o.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' :
                    o.paymentStatus === 'upi_pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    o.paymentStatus === 'upi_failed' ? 'bg-red-500/20 text-red-400' :
                    'bg-slate-700 text-slate-400'
                  }`}>{o.paymentStatus}</span>
                  <span className="text-sm font-bold text-white">₹{o.totalAmount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
