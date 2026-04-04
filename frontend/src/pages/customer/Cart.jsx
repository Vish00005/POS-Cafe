import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import CartItem from '../../components/CartItem';
import { useCart } from '../../context/CartContext';
import { ArrowLeft, ShoppingBag, CreditCard, ChevronRight } from 'lucide-react';

const Cart = () => {
  const table = new URLSearchParams(window.location.search).get('table');
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();

  const toCheckout = () => navigate(`/menu/checkout${table ? `?table=${table}` : ''}`);
  const toMenu = () => navigate(`/menu${table ? `?table=${table}` : ''}`);

  const totalItems = cart.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <Layout>
      <div className="flex flex-col h-screen overflow-hidden slide-in">
        {/* Header */}
        <div className="shrink-0 bg-slate-900/95 border-b border-slate-800 px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={toMenu}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">Your Cart</h1>
              {table && <p className="text-xs text-indigo-400">Table {table}</p>}
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="ml-auto text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-xl transition-all"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-4 pb-12">
              <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center text-4xl">
                🛒
              </div>
              <div className="text-center">
                <h2 className="text-base font-semibold text-slate-400">Cart is empty</h2>
                <p className="text-sm text-slate-600 mt-1">Add items from the menu</p>
              </div>
              <button
                onClick={toMenu}
                className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-w-lg mx-auto">
              {cart.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}

              {/* Order note */}
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-800/40 rounded-xl p-3 mt-4">
                <ShoppingBag size={13} />
                <span>{totalItems} item{totalItems > 1 ? 's' : ''} selected — review before checkout</span>
              </div>
            </div>
          )}
        </div>

        {/* Summary + CTA */}
        {cart.length > 0 && (
          <div className="shrink-0 bg-slate-900 border-t border-slate-800 px-4 py-4 space-y-3">
            {/* Bill lines */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal ({totalItems} item{totalItems > 1 ? 's' : ''})</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-xs">
                <span>Taxes & service</span>
                <span>₹0.00</span>
              </div>
              <div className="flex justify-between font-bold text-white text-base pt-1 border-t border-slate-800">
                <span>Total</span>
                <span className="text-indigo-400">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={toCheckout}
              className="w-full flex items-center justify-between bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white px-5 py-3.5 rounded-2xl font-semibold transition-all shadow-lg shadow-indigo-500/20"
            >
              <div className="flex items-center gap-2">
                <CreditCard size={18} />
                Proceed to Checkout
              </div>
              <div className="flex items-center gap-1">
                <span>₹{total.toFixed(2)}</span>
                <ChevronRight size={16} />
              </div>
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
