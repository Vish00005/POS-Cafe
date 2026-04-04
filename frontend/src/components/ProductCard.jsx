import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { Plus, Minus, Star, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

/**
 * ProductCard - A versatile card for products across all roles.
 * @param {string} variant - 'customer' (default), 'cashier', 'admin'
 */
const ProductCard = ({ 
  product, 
  isGuest, 
  variant = "customer",
  quantity,
  onAdd,
  onRemove,
  onEdit,
  onDelete,
  onClick
}) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  
  // Logic for customer variant (uses context)
  const inCartContext = cart.find((i) => i._id === product._id);
  const displayQuantity = variant === 'customer' ? inCartContext?.quantity : quantity;
  const hasInCart = displayQuantity > 0;

  const handleAdd = (e) => {
    if (e) e.stopPropagation();
    
    if (variant === 'customer') {
      if (isGuest) {
        toast("Please login to start ordering", { icon: "🔐" });
        navigate("/login");
        return;
      }
      addToCart(product);
      toast.success(`${product.name} added!`, { duration: 800, icon: "🛒" });
    } else if (onAdd) {
      onAdd(product);
    }
  };

  const wrapClick = () => {
    if (variant === 'cashier' && onClick) {
      onClick(product);
    }
  };

  return (
    <div 
      onClick={wrapClick}
      className={`glass rounded-2xl overflow-hidden card-hover flex flex-col group transition-all duration-300 border-2 ${
        variant === 'cashier' && hasInCart ? 'border-indigo-500 shadow-lg shadow-indigo-500/10' : 'border-transparent'
      } ${variant === 'cashier' ? 'cursor-pointer active:scale-[0.98]' : ''}`}
    >
      {/* Image Container */}
      <div className="relative h-48 bg-slate-800/80 flex items-center justify-center overflow-hidden">
        <img
          src={product.img || "https://cdn-icons-png.flaticon.com/128/8633/8633559.png"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = "https://cdn-icons-png.flaticon.com/128/8633/8633559.png";
          }}
        />
        
        {/* Badges */}
        {hasInCart && (
          <div className="absolute top-3 right-3 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-black text-white shadow-lg ring-2 ring-slate-900 animate-in zoom-in duration-300">
            {displayQuantity}
          </div>
        )}

        {variant === 'admin' && (
          <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(product); }}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg transition-colors"
              title="Edit Product"
            >
              <Pencil size={15} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(product._id); }}
              className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg transition-colors"
              title="Delete Product"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}

        {variant === 'admin' && !product.isAvailable && (
          <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center backdrop-blur-[2px]">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-slate-950/80 px-3 py-1.5 rounded-full border border-red-900/30">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-sm font-bold text-white leading-tight line-clamp-1 group-hover:text-indigo-300 transition-colors">
            {product.name}
          </h3>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-sm font-black text-indigo-400 whitespace-nowrap">
              ₹{product.price}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-2.5">
          {product.category && (
            <span className="text-[10px] font-bold text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-md uppercase tracking-wider">
              {product.category}
            </span>
          )}
          <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-500/80">
            <Star size={10} fill="currentColor" />
            <span>{product.avgRating?.toFixed(1) || "0.0"}</span>
            <span className="text-slate-600 font-medium">({product.totalReviews || 0})</span>
          </div>
        </div>

        {product.description && variant !== 'cashier' && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-4 font-medium leading-relaxed group-hover:text-slate-400 transition-colors">
            {product.description}
          </p>
        )}

        {/* Dynamic Controls based on variant */}
        <div className="mt-auto">
          {variant === 'customer' && (
            hasInCart ? (
              <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-1 animate-in slide-in-from-bottom-2 duration-300">
                <button
                  onClick={(e) => { e.stopPropagation(); updateQuantity(product._id, inCartContext.quantity - 1); }}
                  className="w-9 h-9 bg-slate-700 hover:bg-red-600/20 hover:text-red-400 text-slate-300 rounded-lg flex items-center justify-center transition-all active:scale-90"
                >
                  <Minus size={16} />
                </button>
                <span className="text-white font-black text-sm w-8 text-center">
                  {inCartContext.quantity}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                  className="w-9 h-9 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center justify-center transition-all shadow-lg shadow-indigo-500/10 active:scale-95"
                >
                  <Plus size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-[11px] font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/10 group-hover:shadow-indigo-500/20"
              >
                <Plus size={14} /> Add to Cart
              </button>
            )
          )}
          
          {variant === 'cashier' && (
            <div className={`text-[10px] font-black uppercase tracking-[0.2em] text-center p-1.5 rounded-lg transition-all ${hasInCart ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-600'}`}>
              {hasInCart ? 'Item Added' : 'Tap to toggle'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

