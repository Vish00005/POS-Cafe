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
      <div className="text-center space-y-1">
        <div className="text-xs text-slate-500">Pay to UPI ID</div>
        <div className="text-sm font-mono font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg">
          {upiId}
        </div>
        <div className="text-xs text-slate-500">
          Supported: GPay · PhonePe · Paytm · BHIM
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl">
        <ShieldCheck size={14} />
        Secure UPI payment — verified by NPCI
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
