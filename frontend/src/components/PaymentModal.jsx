import { useState } from 'react';
import { X, Banknote, Smartphone, CreditCard, ArrowRight, Loader2 } from 'lucide-react';
import QRPayment from './QRPayment';

/**
 * PaymentModal handles method selection + UPI QR flow.
 * Props:
 *   total      - cart total (number)
 *   tableNumber - table # (string)
 *   onConfirm  - (method, upiConfirmed) => void  called when ready to place order
 *   onClose    - close modal
 *   loading    - order is being placed
 */
const PaymentModal = ({ total, tableNumber, onConfirm, onClose, loading }) => {
  const [step, setStep] = useState('select'); // 'select' | 'upi' | 'confirm'
  const [method, setMethod] = useState(null);
  const [upiPaid, setUpiPaid] = useState(false);

  const methods = [
    {
      id: 'upi',
      label: 'UPI',
      desc: 'GPay · PhonePe · Paytm · BHIM',
      icon: Smartphone,
      color: 'from-purple-600 to-indigo-600',
      ring: 'ring-indigo-500',
    },
    {
      id: 'card',
      label: 'Card',
      desc: 'Debit / Credit / Tap to Pay',
      icon: CreditCard,
      color: 'from-blue-600 to-cyan-600',
      ring: 'ring-blue-500',
    },
    {
      id: 'cash',
      label: 'Cash',
      desc: 'Pay at the counter',
      icon: Banknote,
      color: 'from-emerald-600 to-teal-600',
      ring: 'ring-emerald-500',
    },
  ];

  const handleMethodSelect = (m) => {
    setMethod(m);
    // UPI + Card both go through Razorpay which handles its own payment UI (QR, netbanking etc.)
    // So we skip our custom QR screen and go straight to confirm
    setStep('confirm');
  };

  const handleUpiPaid = () => {
    setUpiPaid(true);
    setStep('confirm');
  };

  const handlePlaceOrder = () => {
    onConfirm(method, upiPaid);
  };

  const selectedMethod = methods.find((m) => m.id === method);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="glass w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-slate-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
          <div>
            <h2 className="text-lg font-bold text-white">
              {step === 'select' && 'Choose Payment'}
              {step === 'upi' && 'UPI Payment'}
              {step === 'confirm' && 'Confirm Order'}
            </h2>
            <p className="text-xs text-slate-400">Table {tableNumber} · ₹{total.toFixed(2)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {/* STEP: Select method */}
          {step === 'select' && (
            <div className="space-y-3">
              <p className="text-slate-400 text-sm text-center mb-4">How would you like to pay?</p>
              {methods.map(({ id, label, desc, icon: Icon, color, ring }) => (
                <button
                  key={id}
                  onClick={() => handleMethodSelect(id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-transparent hover:ring-2 ${ring} bg-slate-800/60 hover:bg-slate-800 transition-all group`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${color} flex items-center justify-center shadow-lg shrink-0`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-white">{label}</div>
                    <div className="text-xs text-slate-400">{desc}</div>
                  </div>
                  <ArrowRight size={18} className="text-slate-500 group-hover:text-white transition-colors" />
                </button>
              ))}
            </div>
          )}

          {/* STEP: UPI QR */}
          {step === 'upi' && (
            <div>
              <QRPayment total={total} onPaid={handleUpiPaid} />
              <button
                onClick={() => setStep('select')}
                className="w-full mt-3 text-slate-400 hover:text-white text-sm py-2 transition-colors"
              >
                ← Change payment method
              </button>
            </div>
          )}

          {/* STEP: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-4">
              {/* Method recap */}
              {selectedMethod && (
                <div className="flex items-center gap-3 p-4 bg-slate-800/60 rounded-2xl">
                  <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${selectedMethod.color} flex items-center justify-center shrink-0`}>
                    <selectedMethod.icon size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{selectedMethod.label}</div>
                    <div className="text-xs text-slate-400">{selectedMethod.desc}</div>
                  </div>
                  {method === 'upi' && (
                    <span className="ml-auto text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-medium">
                      ✓ Paid
                    </span>
                  )}
                </div>
              )}

              {/* Bill breakdown */}
              <div className="bg-slate-800/60 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Subtotal</span><span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Service charge</span><span>₹0.00</span>
                </div>
                <div className="border-t border-slate-700 pt-2 flex justify-between font-bold text-white text-base">
                  <span>Total</span>
                  <span className="text-indigo-400">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {method === 'cash' && (
                <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-sm text-yellow-400">
                  <Banknote size={16} />
                  Please pay ₹{total.toFixed(2)} at the counter after receiving your order.
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 text-base"
              >
                {loading ? (
                  <><Loader2 size={20} className="animate-spin" /> Placing Order...</>
                ) : (
                  <>Place Order · ₹{total.toFixed(2)}</>
                )}
              </button>

              <button
                onClick={() => setStep('select')}
                disabled={loading}
                className="w-full text-slate-500 hover:text-white text-sm py-2 transition-colors disabled:pointer-events-none"
              >
                ← Change payment method
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
