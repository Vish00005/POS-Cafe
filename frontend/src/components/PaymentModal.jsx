import { useState, useEffect } from "react";
import {
  X,
  Banknote,
  Smartphone,
  CreditCard,
  ArrowRight,
  Loader2,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import api from "../services/api";

/**
 * PaymentModal — 3 methods:
 *   UPI  → shows QR from admin settings UPI ID → "I've Paid" → order placed as upi_pending
 *   Card → Razorpay popup (handled externally via onConfirm)
 *   Cash → direct confirm → order placed as pending
 */
const PaymentModal = ({ total, tableNumber, onConfirm, onClose, loading }) => {
  const [step, setStep] = useState("select"); // 'select' | 'upi' | 'confirm'
  const [method, setMethod] = useState(null);
  const [settings, setSettings] = useState({
    upiId: "",
    upiName: "Odoo Cafeteria",
  });

  useEffect(() => {
    api
      .get("/api/v1/settings")
      .then(({ data }) => setSettings(data))
      .catch(() => {});
  }, []);

  const methods = [
    {
      id: "upi",
      label: "UPI",
      desc: "Scan QR to pay instantly",
      icon: Smartphone,
      color: "from-purple-600 to-indigo-600",
      ring: "ring-indigo-500",
    },
    {
      id: "card",
      label: "Card",
      desc: "Debit / Credit via Razorpay",
      icon: CreditCard,
      color: "from-blue-600 to-cyan-600",
      ring: "ring-blue-500",
    },
    {
      id: "cash",
      label: "Cash",
      desc: "Pay at the counter",
      icon: Banknote,
      color: "from-emerald-600 to-teal-600",
      ring: "ring-emerald-500",
    },
  ];

  const handleSelect = (m) => {
    setMethod(m);
    setStep(m === "upi" ? "upi" : "confirm");
  };

  const upiLink = settings.upiId
    ? `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.upiName || "Odoo Cafeteria")}&am=${total.toFixed(2)}&cu=INR`
    : "upi://pay?pa=placeholder@upi";

  const selectedM = methods.find((m) => m.id === method);

  return (
    <div className="fixed inset-0 z-100 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="glass w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto pb-20 sm:pb-0">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-slate-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
          <div>
            <p className="text-slate-400 mt-1 uppercase tracking-widest font-bold">Odoo Cafeteria</p>
            <h2 className="text-lg font-bold text-white">
              {step === "select" && "Choose Payment"}
              {step === "upi" && "UPI Payment"}
              {step === "confirm" && "Confirm Order"}
            </h2>
            <p className="text-xs text-slate-400">
              Table {tableNumber} · ₹{total.toFixed(2)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {/* ── SELECT ── */}
          {step === "select" && (
            <div className="space-y-3">
              {methods.map(({ id, label, desc, icon: Icon, color, ring }) => (
                <button
                  key={id}
                  onClick={() => handleSelect(id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-transparent hover:ring-2 ${ring} bg-slate-800/60 hover:bg-slate-800 transition-all group`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-linear-to-br ${color} flex items-center justify-center shrink-0`}
                  >
                    <Icon size={22} className="text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-white">{label}</div>
                    <div className="text-xs text-slate-400">{desc}</div>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-slate-500 group-hover:text-white transition-colors"
                  />
                </button>
              ))}
            </div>
          )}

          {/* ── UPI QR ── */}
          {step === "upi" && (
            <div className="space-y-5">
              {!settings.upiId ? (
                <div className="text-center py-8 text-yellow-400 text-sm">
                  ⚠️ UPI ID not configured. Please ask the cashier or admin.
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                      Amount to Pay
                    </div>
                    <div className="text-4xl font-black text-white">
                      ₹{total.toFixed(2)}
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div className="p-4 bg-white rounded-2xl shadow-xl">
                      <QRCodeSVG value={upiLink} size={190} level="H" />
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider italic">
                      📸 Take a Screenshot (SS) and then Pay
                    </div>
                    <div className="text-sm font-mono font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg inline-block border border-indigo-500/10">
                      {settings.upiId}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="text-[10px] text-slate-500">
                        GPay · PhonePe · Paytm · BHIM
                      </div>
                      <div className="text-[10px] text-indigo-500 font-bold animate-pulse">
                        🚀 Direct App Integration Coming Soon
                      </div>
                    </div>
                  </div>

                  {/* Important notice */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-xs text-yellow-400">
                      <Clock size={14} className="mt-0.5 shrink-0" />
                      <span>
                        After paying, tap "I Have Paid" below. Your order will
                        be placed and a cashier will verify your payment before
                        the kitchen prepares it.
                      </span>
                    </div>
                    <div className="text-center text-[11px] text-yellow-500 font-bold bg-yellow-500/5 py-2 rounded-lg border border-yellow-500/10">
                      ⏳ Wait for confirmation & ticket after payment
                    </div>
                  </div>

                  <button
                    onClick={() => onConfirm("upi")}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={20} />I Have Paid ₹
                        {total.toFixed(2)}
                      </>
                    )}
                  </button>
                </>
              )}
              <button
                onClick={() => setStep("select")}
                className="w-full text-slate-500 hover:text-white text-sm py-2"
              >
                ← Change method
              </button>
            </div>
          )}

          {/* ── CONFIRM (Cash / Card) ── */}
          {step === "confirm" && (
            <div className="space-y-4">
              {selectedM && (
                <div className="flex items-center gap-3 p-4 bg-slate-800/60 rounded-2xl">
                  <div
                    className={`w-10 h-10 rounded-xl bg-linear-to-br ${selectedM.color} flex items-center justify-center shrink-0`}
                  >
                    <selectedM.icon size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {selectedM.label}
                    </div>
                    <div className="text-xs text-slate-400">
                      {selectedM.desc}
                    </div>
                  </div>
                </div>
              )}

              {/* Bill */}
              <div className="bg-slate-800/60 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Subtotal</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500 ">
                  <span>Service charge</span>
                  <span>₹0.00</span>
                </div>
                <div className="border-t border-slate-700 pt-2 flex justify-between font-bold text-white">
                  <span>Total</span>
                  <span className="text-indigo-400">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {method === "cash" && (
                <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-sm text-yellow-400">
                  <Banknote size={16} /> Pay ₹{total.toFixed(2)} at the counter
                  after receiving your order.
                </div>
              )}
              {method === "card" && (
                <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-sm text-blue-400">
                  <CreditCard size={16} /> Razorpay checkout will open next.
                </div>
              )}

              <button
                onClick={() => onConfirm(method)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Place Order · ₹{total.toFixed(2)}</>
                )}
              </button>
              <button
                onClick={() => setStep("select")}
                disabled={loading}
                className="w-full text-slate-500 hover:text-white text-sm py-2 disabled:pointer-events-none"
              >
                ← Change method
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
