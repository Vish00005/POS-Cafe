import { useCart } from '../context/CartContext';
import { Plus, Minus, Trash2 } from 'lucide-react';

const CartItem = ({ item }) => {
  const { addToCart, updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex items-center gap-3 bg-slate-800/60 rounded-2xl p-3 slide-in">
      {/* Thumbnail */}
      <div className="w-14 h-14 shrink-0 bg-slate-700 rounded-xl flex items-center justify-center overflow-hidden">
        <img
          src={item.img || 'https://cdn-icons-png.flaticon.com/128/8633/8633559.png'}
          alt={item.name}
          className="w-11 h-11 object-contain"
          onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/128/8633/8633559.png'; }}
        />
      </div>

      {/* Name & price */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white truncate">{item.name}</div>
        <div className="text-xs text-slate-400">₹{item.price} each</div>
        <div className="text-sm font-bold text-indigo-400 mt-0.5">
          ₹{(item.price * item.quantity).toFixed(2)}
        </div>
      </div>

      {/* Quantity stepper */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => updateQuantity(item._id, item.quantity - 1)}
          className="w-7 h-7 bg-slate-700 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors"
          aria-label="Decrease"
        >
          {item.quantity === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
        </button>
        <span className="w-6 text-center text-sm font-bold text-white">{item.quantity}</span>
        <button
          onClick={() => addToCart(item)}
          className="w-7 h-7 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center justify-center transition-colors"
          aria-label="Increase"
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
