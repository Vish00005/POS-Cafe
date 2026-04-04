import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import {
  Banknote, Smartphone, CreditCard, ChevronDown, ChevronUp,
  CalendarDays, RefreshCw, IndianRupee,
} from 'lucide-react';

/* ── helpers ── */
const today = () => new Date().toISOString().slice(0, 10);

const statusBadge = {
  pending:   'bg-yellow-500/20 text-yellow-400',
  preparing: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-green-500/20 text-green-400',
};
const payBadge = {
  pending:     'bg-slate-700 text-slate-300',
  paid:        'bg-green-500/20 text-green-400',
  upi_pending: 'bg-yellow-500/20 text-yellow-400',
  upi_failed:  'bg-red-500/20 text-red-400',
};

const fmt = (d) =>
  new Date(d).toLocaleString('en-IN', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

/* ── Single expandable order row ── */
const OrderRow = ({ order }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Summary row — clickable */}
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-800/50 transition-colors rounded-xl group"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Expand icon */}
          <div className="text-slate-600 group-hover:text-slate-400 shrink-0">
            {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-indigo-400 font-semibold">{order.orderNumber}</span>
              <span className="text-xs text-slate-500">Table {order.tableNumber}</span>
              {order.customer?.name && (
                <span className="text-xs text-slate-500">· {order.customer.name}</span>
              )}
            </div>
            <div className="text-xs text-slate-600 mt-0.5">{fmt(order.createdAt)}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[order.status] || 'bg-slate-700 text-slate-400'}`}>
            {order.status}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${payBadge[order.paymentStatus] || 'bg-slate-700 text-slate-400'}`}>
            {order.paymentStatus}
          </span>
          <span className="text-sm font-bold text-white">₹{order.totalAmount?.toFixed(2)}</span>
        </div>
      </div>

      {/* Expanded detail */}
      {open && (
        <div className="mx-4 mb-3 bg-slate-900/60 rounded-xl p-4 border border-slate-800 text-sm space-y-3 slide-in">
          {/* Items table */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Items</div>
            <div className="space-y-1.5">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-slate-300">
                  <span>
                    {item.name}
                    <span className="text-slate-500 ml-1.5">×{item.quantity}</span>
                  </span>
                  <span className="font-medium text-white">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer details */}
          <div className="border-t border-slate-800 pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <div className="text-slate-500">Order #</div>
              <div className="text-indigo-400 font-mono mt-0.5">{order.orderNumber}</div>
            </div>
            <div>
              <div className="text-slate-500">Table</div>
              <div className="text-white mt-0.5">{order.tableNumber}</div>
            </div>
            <div>
              <div className="text-slate-500">Customer</div>
              <div className="text-white mt-0.5">{order.customer?.name || '—'}</div>
            </div>
            <div>
              <div className="text-slate-500">Total</div>
              <div className="text-emerald-400 font-bold mt-0.5">₹{order.totalAmount?.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-slate-500">Order Status</div>
              <div className={`inline-flex mt-0.5 px-2 py-0.5 rounded-full font-medium ${statusBadge[order.status] || ''}`}>{order.status}</div>
            </div>
            <div>
              <div className="text-slate-500">Payment Status</div>
              <div className={`inline-flex mt-0.5 px-2 py-0.5 rounded-full font-medium ${payBadge[order.paymentStatus] || ''}`}>{order.paymentStatus}</div>
            </div>
            <div>
              <div className="text-slate-500">Method</div>
              <div className="text-white capitalize mt-0.5">{order.paymentMethod}</div>
            </div>
            <div>
              <div className="text-slate-500">Date & Time</div>
              <div className="text-white mt-0.5">{fmt(order.createdAt)}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ── Payment-method column ── */
const PaymentColumn = ({ method, label, icon: Icon, color, orders }) => {
  const total     = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const paidTotal = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + (o.totalAmount || 0), 0);

  const gradients = {
    cash: 'from-emerald-500/10 to-transparent border-emerald-500/20',
    upi:  'from-purple-500/10 to-transparent border-purple-500/20',
    card: 'from-blue-500/10 to-transparent border-blue-500/20',
  };

  return (
    <div className={`glass rounded-2xl border bg-linear-to-b ${gradients[method]} flex flex-col min-h-64`}>
      {/* Column header */}
      <div className="px-5 py-4 border-b border-slate-800/50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg bg-${color}-500/20 flex items-center justify-center`}>
              <Icon size={16} className={`text-${color}-400`} />
            </div>
            <div>
              <div className="font-bold text-white">{label}</div>
              <div className="text-xs text-slate-500">{orders.length} order{orders.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-0.5 text-white font-black text-lg">
              <IndianRupee size={14} className="text-slate-400 mt-0.5" />
              {total.toFixed(2)}
            </div>
            {method !== 'cash' && (
              <div className="text-xs text-emerald-400">
                ₹{paidTotal.toFixed(2)} paid
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Orders list */}
      <div className="flex-1 divide-y divide-slate-800/40 overflow-y-auto max-h-[60vh] py-1">
        {orders.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-slate-600 text-sm">No {label} orders</div>
        ) : (
          orders.map(o => <OrderRow key={o._id} order={o} />)
        )}
      </div>
    </div>
  );
};

/* ── Main page ── */
const AdminOrders = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'custom'
  const [customDate, setCustomDate] = useState(today());

  const fetchOrders = () => {
    setLoading(true);
    api.get('/api/v1/order')
      .then(({ data }) => setOrders(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  // Apply date filter
  const dateFiltered = useMemo(() => {
    if (dateFilter === 'all') return orders;
    const target = dateFilter === 'today' ? today() : customDate;
    return orders.filter(o => o.createdAt?.slice(0, 10) === target);
  }, [orders, dateFilter, customDate]);

  // Split by payment method
  const cashOrders = dateFiltered.filter(o => o.paymentMethod === 'cash');
  const upiOrders  = dateFiltered.filter(o => o.paymentMethod === 'upi');
  const cardOrders = dateFiltered.filter(o => o.paymentMethod === 'card');
  const grandTotal = dateFiltered.reduce((s, o) => s + (o.totalAmount || 0), 0);

  return (
    <Layout>
      <div className="p-4 sm:p-6 space-y-5 slide-in">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">Order History</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {dateFiltered.length} orders · Grand total&nbsp;
              <span className="text-white font-bold">₹{grandTotal.toFixed(2)}</span>
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Date quick filters */}
            {[
              { id: 'all',   label: 'All Time' },
              { id: 'today', label: "Today's" },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setDateFilter(id)}
                className={`text-sm px-3 py-2 rounded-xl font-medium transition-all ${
                  dateFilter === id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}

            {/* Custom date picker */}
            <label className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 cursor-pointer hover:border-indigo-500 transition-all">
              <CalendarDays size={14} className="text-slate-400 shrink-0" />
              <input
                type="date"
                value={customDate}
                max={today()}
                onChange={e => { setCustomDate(e.target.value); setDateFilter('custom'); }}
                className="bg-transparent text-slate-300 text-sm outline-none cursor-pointer"
              />
            </label>

            <button onClick={fetchOrders} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-all">
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Spinner size="lg" /></div>
        ) : (
          /* ── Three-column layout ── */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <PaymentColumn
              method="cash"
              label="Cash"
              icon={Banknote}
              color="emerald"
              orders={cashOrders}
            />
            <PaymentColumn
              method="upi"
              label="UPI"
              icon={Smartphone}
              color="purple"
              orders={upiOrders}
            />
            <PaymentColumn
              method="card"
              label="Card"
              icon={CreditCard}
              color="blue"
              orders={cardOrders}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminOrders;
