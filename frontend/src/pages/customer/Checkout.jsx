import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Layout from "../../components/Layout";
import PaymentModal from "../../components/PaymentModal";
import Spinner from "../../components/Spinner";
import { loadRazorpay } from "../../utils/loadRazorpay";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowLeft,
  CheckCircle,
  Package,
  MapPin,
  Clock,
  CreditCard,
  Table2,
} from "lucide-react";
import toast from "react-hot-toast";

/* ── Success Screen ── */
const SuccessScreen = ({ orderNumber, table, total, paymentMethod }) => {
  const navigate = useNavigate();
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center p-6 slide-in">
        <div className="glass rounded-3xl p-8 max-w-sm w-full text-center space-y-5 border border-green-500/20">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-40" />
            <div className="relative w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle size={48} className="text-green-400" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">
              Order Confirmed! 🎉
            </h2>
            <p className="text-slate-400 mt-1 uppercase tracking-widest font-bold">Odoo Cafeteria</p>
            <p className="text-slate-400 text-sm mt-1">
              Your order is on its way to the kitchen
            </p>
          </div>
          <div className="bg-slate-800/60 rounded-2xl p-4 space-y-3 text-left">
            <div className="flex items-center gap-3">
              <Package size={16} className="text-indigo-400 shrink-0" />
              <div>
                <div className="text-xs text-slate-500">Order Number</div>
                <div className="text-sm font-bold text-indigo-400 font-mono">
                  {orderNumber}
                </div>
              </div>
            </div>
            {table && (
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs text-slate-500">Serving to</div>
                  <div className="text-sm font-bold text-white">
                    Table {table}
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <CreditCard size={16} className="text-yellow-400 shrink-0" />
              <div>
                <div className="text-xs text-slate-500">Payment</div>
                <div className="text-sm font-bold text-white capitalize">
                  {paymentMethod} · ₹{total.toFixed(2)}
                  {paymentMethod === "upi" && (
                    <span className="text-green-400 ml-1">✓ Paid</span>
                  )}
                  {paymentMethod === "card" && (
                    <span className="text-green-400 ml-1">✓ Paid</span>
                  )}
                  {paymentMethod === "cash" && (
                    <span className="text-yellow-400 ml-1">
                      · Pay at counter
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-purple-400 shrink-0" />
              <div>
                <div className="text-xs text-slate-500">Estimated Time</div>
                <div className="text-sm font-bold text-white">
                  ~ 10–15 minutes
                </div>
              </div>
            </div>
          </div>
          {paymentMethod === "cash" && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-xs text-yellow-400">
              💵 Please collect your food and pay ₹{total.toFixed(2)} at the
              billing counter.
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/menu${table ? `?table=${table}` : ""}`)}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl text-sm font-semibold transition-all"
            >
              Order More
            </button>
            <button
              onClick={() => navigate("/menu/orders")}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-sm font-semibold transition-all"
            >
              My Orders
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

/* ── Table Selector ── */
const TableSelector = ({ selectedTable, onSelect }) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFloor, setActiveFloor] = useState("all");

  useEffect(() => {
    api
      .get("/api/v1/table")
      .then(({ data }) =>
        setTables(data.filter((t) => t.isActive && !t.isOccupied)),
      )
      .finally(() => setLoading(false));
  }, []);

  const floors = [
    ...new Set(tables.map((t) => t.floor).filter(Boolean)),
  ].sort();
  const displayed =
    activeFloor === "all"
      ? tables
      : tables.filter((t) => t.floor === parseInt(activeFloor));

  return (
    <div className="glass rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Table2 size={16} className="text-indigo-400" />
        <h3 className="font-semibold text-white text-sm">Select Your Table</h3>
        {selectedTable && (
          <span className="ml-auto text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full font-medium">
            Table {selectedTable} ✓
          </span>
        )}
      </div>

      {/* Floor filter */}
      {floors.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveFloor("all")}
            className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${activeFloor === "all" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}
          >
            All
          </button>
          {floors.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFloor(String(f))}
              className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${activeFloor === String(f) ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}
            >
              Floor {f}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-4 text-slate-500 text-sm">
          No free tables available on this floor
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {displayed.map((t) => (
            <button
              key={t._id}
              onClick={() => onSelect(String(t.tableNumber))}
              className={`py-3 rounded-xl text-sm font-bold transition-all ${
                selectedTable === String(t.tableNumber)
                  ? "bg-indigo-600 text-white ring-2 ring-indigo-400"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {t.tableNumber}
            </button>
          ))}
        </div>
      )}
      <p className="text-xs text-slate-600">
        Only free tables are shown. Occupied tables are not selectable.
      </p>
    </div>
  );
};

/* ── Checkout Main ── */
const Checkout = () => {
  const tableFromUrl = new URLSearchParams(window.location.search).get("table");
  // Fall back to the table saved in session when customer came via QR then navigated away
  const tableFromSession = sessionStorage.getItem("assignedTable");
  const initialTable = tableFromUrl || tableFromSession || "";

  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedTable, setSelectedTable] = useState(initialTable);
  const [showModal, setShowModal] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(null);
  const [tableInvalidated, setTableInvalidated] = useState(false);

  const totalItems = cart.reduce((acc, i) => acc + i.quantity, 0);

  // Validate the assigned table is still recognised (not freed by cashier)
  useEffect(() => {
    if (!selectedTable) return;
    api
      .get("/api/v1/table")
      .then(({ data }) => {
        const t = data.find(
          (t) => String(t.tableNumber) === String(selectedTable),
        );
        // If table no longer exists or was explicitly freed (isOccupied=false) while we still
        // have our session AND no active order placed yet, force re-select
        if (!t) {
          sessionStorage.removeItem("assignedTable");
          setSelectedTable("");
          setTableInvalidated(true);
        }
      })
      .catch(() => {});
  }, []);

  // ── Builds the cart items array for the order API
  const buildItems = () =>
    cart.map((i) => ({
      productId: i._id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
    }));

  // ── Places the cafe order after payment is confirmed
  const placeOrder = async (method, email) => {
    const { data } = await api.post("/api/v1/order", {
      tableNumber: parseInt(selectedTable),
      items: buildItems(),
      paymentMethod: method,
      customer: user._id,
      email,
    });
    const orderTotal = total; // capture before clearCart zeroes it
    clearCart();
    setShowModal(false);
    setSuccess({
      orderNumber: data.orderNumber,
      paymentMethod: method,
      total: orderTotal,
    });
    toast.success("Order placed!");
  };

  // ── Main payment handler — branched on method
  const handleConfirm = async (method, email) => {
    if (!selectedTable) return toast.error("Please select a table first");
    if (cart.length === 0) return toast.error("Your cart is empty");
    setPlacing(true);

    try {
      // ── CASH: direct order — kitchen waits for cashier
      if (method === "cash") {
        await placeOrder("cash", email);
        return;
      }

      // ── UPI: place order as upi_pending — cashier will confirm after verifying screenshot
      if (method === "upi") {
        await placeOrder("upi", email);
        return;
      }

      // ── CARD: open Razorpay popup (card only)
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error(
          "Failed to load payment gateway. Check your internet connection.",
        );
        return;
      }

      const { data: rzpOrder } = await api.post(
        "/api/v1/payment/create-order",
        { amount: total },
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "Odoo Cafeteria",
        description: `Table ${selectedTable} Order`,
        order_id: rzpOrder.id,
        prefill: {
          name: user?.name || "Customer",
          email: email || user?.email || "customer@cafe.com",
        },
        theme: { color: "#6366f1" },
        method: { upi: false, card: true, netbanking: false, wallet: false },

        handler: async () => {
          try {
            await placeOrder("card", email);
          } catch (err) {
            toast.error(
              err.response?.data?.message ||
                "Order creation failed after payment",
            );
          } finally {
            setPlacing(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        toast.error(
          `Payment failed: ${response.error?.description || "Please try again"}`,
        );
        setPlacing(false);
      });

      rzp.open();
      return;
      // Note: setPlacing(false) is handled inside handler / payment.failed callbacks above
      return; // don't fall through to the finally block for async Razorpay flow
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      // For cash this runs immediately; for Razorpay, handler manages state instead
      if (method === "cash") setPlacing(false);
    }
  };

  if (success) {
    return (
      <SuccessScreen
        orderNumber={success.orderNumber}
        table={selectedTable}
        total={success.total}
        paymentMethod={success.paymentMethod}
      />
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-full overflow-hidden slide-in">
        {/* Header */}
        <div className="shrink-0 bg-slate-900/95 border-b border-slate-800 px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                navigate(
                  `/menu/cart${tableFromUrl ? `?table=${tableFromUrl}` : ""}`,
                )
              }
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white tracking-widest uppercase">Odoo Cafeteria</span>
                <span className="w-1 h-1 bg-slate-700 rounded-full" />
                <h1 className="text-sm font-bold text-slate-400">Checkout</h1>
              </div>
              {selectedTable ? (
                <p className="text-xs text-indigo-400">Table {selectedTable}</p>
              ) : (
                <p className="text-xs text-yellow-400">Select a table below</p>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Table invalidation notice */}
          {tableInvalidated && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-sm text-yellow-400 flex items-center gap-2">
              ⚠️ Your previously assigned table is no longer available. Please
              select a new table.
            </div>
          )}

          {/* Table selector: shown when no QR table OR when session table was invalidated */}
          {(!tableFromUrl || tableInvalidated) && (
            <TableSelector
              selectedTable={selectedTable}
              onSelect={(t) => {
                setSelectedTable(t);
                sessionStorage.setItem("assignedTable", t);
              }}
            />
          )}

          {/* Order review */}
          <div className="glass rounded-2xl p-4 space-y-3">
            <div className="font-bold text-white text-sm tracking-widest uppercase">Odoo Cafeteria</div>
            {cart.map((item) => (
              <div key={item._id} className="flex justify-between text-sm">
                <span className="text-slate-300">
                  {item.name}
                  <span className="text-slate-500 ml-1.5">
                    ×{item.quantity}
                  </span>
                </span>
                <span className="text-white font-medium">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="border-t border-slate-700 pt-3 flex justify-between font-bold text-white">
              <span>Total ({totalItems} items)</span>
              <span className="text-indigo-400">₹{total.toFixed(2)}</span>
            </div>
          </div>

          {selectedTable && (
            <div className="flex items-center gap-3 glass rounded-2xl p-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-white" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Serving to</div>
                <div className="font-bold text-white">
                  Table {selectedTable}
                </div>
              </div>
            </div>
          )}

          {/* Payment info */}
          <div className="glass rounded-2xl p-4 space-y-2 text-xs text-slate-500">
            <div className="flex items-center gap-2 text-slate-400 font-medium text-sm mb-1">
              <CreditCard size={15} /> Payment Options
            </div>
            <p>
              • <span className="text-purple-400 font-medium">UPI</span> – Scan
              QR and pay instantly. Kitchen starts immediately.
            </p>
            <p>
              • <span className="text-blue-400 font-medium">Card</span> –
              Tap/Swipe at counter. Kitchen starts immediately.
            </p>
            <p>
              • <span className="text-blue-400 font-medium">Cash</span> – Pay at
              counter for receiving order.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="shrink-0 bg-slate-900 border-t border-slate-800 px-4 py-4">
          <button
            onClick={() => {
              if (!selectedTable)
                return toast.error("Please select a table first");
              setShowModal(true);
            }}
            disabled={cart.length === 0 || placing}
            className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-2xl transition-all text-base shadow-lg ${
              !selectedTable
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white shadow-indigo-500/20"
            }`}
          >
            <CreditCard size={20} />
            {!selectedTable
              ? "Select a table to continue"
              : `Choose Payment · ₹${total.toFixed(2)}`}
          </button>
        </div>
      </div>

      {showModal && (
        <PaymentModal
          total={total}
          tableNumber={selectedTable}
          onConfirm={handleConfirm}
          onClose={() => setShowModal(false)}
          loading={placing}
        />
      )}
    </Layout>
  );
};

export default Checkout;
