import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, CheckCircle2, ShieldCheck } from 'lucide-react';

/**
 * QRPayment renders a UPI QR code screen.
 * Props:
 *   total    - amount to pay (number)
 *   onPaid   - callback when user confirms payment
 *   upiId    - UPI VPA for the merchant (default: cafe@upi)
 *   name     - merchant name
 */
const QRPayment = ({ total, onPaid, upiId = 'cafe@upi', name = 'Odoo Cafeteria' }) => {
  // Standard UPI deep link
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Cafeteria Order')}`;

  return (
    <div className="flex flex-col items-center gap-5 py-2">
      {/* Header */}
      <div className="flex items-center gap-2 text-indigo-400">
        <Smartphone size={20} />
        <span className="font-semibold text-white">Scan & Pay via UPI</span>
      </div>

      {/* Amount */}
      <div className="text-center">
          <div className="flex flex-col items-center mb-4">
            <span className="text-xl font-black text-white tracking-widest leading-none">ODOO CAFETERIA</span>
            <span className="text-[10px] text-indigo-400 font-bold tracking-[0.2em] uppercase">Premium POS</span>
          </div>
        <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Amount to Pay</div>
        <div className="text-4xl font-black text-white">₹{total.toFixed(2)}</div>
      </div>

      {/* QR Code */}
      <div className="p-4 bg-white rounded-2xl shadow-xl shadow-indigo-500/10">
        <QRCodeSVG
          value={upiLink}
          size={200}
          level="H"
          includeMargin={false}
          imageSettings={{
            src: 'https://cdn-icons-png.flaticon.com/128/825/825454.png',
            height: 36,
            width: 36,
            excavate: true,
          }}
        />
      </div>

      {/* UPI ID */}
      <div className="text-center space-y-2">
        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider italic">
          📸 Take a Screenshot (SS) and then Pay
        </div>
        <div className="text-sm font-mono font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
          {upiId}
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-[10px] text-slate-500 font-medium">
            Supported: GPay · PhonePe · Paytm · BHIM
          </div>
          <div className="text-[10px] text-indigo-500 font-bold animate-pulse">
            🚀 Direct App Integration Coming Soon
          </div>
        </div>
      </div>

      {/* Security & Wait note */}
      <div className="space-y-2 w-full">
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl">
          <ShieldCheck size={12} />
          Secure UPI payment — verified by NPCI
        </div>
        <div className="text-center text-[11px] text-yellow-500 font-bold bg-yellow-500/5 py-2 rounded-lg border border-yellow-500/10">
          ⏳ Wait for confirmation & ticket after payment
        </div>
      </div>

      {/* Confirm button */}
      <button
        onClick={onPaid}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 text-base"
      >
        <CheckCircle2 size={20} />
        I Have Paid ₹{total.toFixed(2)}
      </button>

      <p className="text-xs text-slate-500 text-center max-w-xs">
        Tap above only after completing the UPI payment. Your order will be sent to the kitchen immediately.
      </p>
    </div>
  );
};

export default QRPayment;
