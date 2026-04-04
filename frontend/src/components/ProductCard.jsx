import { useCart } from "../context/CartContext";
import { Plus, Minus, Star } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

const ProductCard = ({ product, isGuest }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const inCart = cart.find((i) => i._id === product._id);

  const handleAdd = () => {
    if (isGuest) {
      toast("Please login to start ordering", { icon: "🔐" });
      navigate("/login");
      return;
    }
    addToCart(product);
    toast.success(`${product.name} added!`, { duration: 800, icon: "🛒" });
  };

  return (
    <div className="glass rounded-2xl overflow-hidden card-hover flex flex-col group">
      {/* Image */}
      <div className="relative h-48 bg-slate-800/80 flex items-center justify-center overflow-hidden">
        <img
          src={
            product.img ||
            "https://cdn-icons-png.flaticon.com/128/8633/8633559.png"
          }
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src =
              "https://cdn-icons-png.flaticon.com/128/8633/8633559.png";
          }}
        />
        {inCart && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg">
            {inCart.quantity}
          </div>
        )}
      </div>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-1 mb-1">
            <h3 className="text-sm font-semibold text-white leading-tight">
              {product.name}
            </h3>
            <div className="flex flex-col items-end">
              <span className="text-sm font-black text-indigo-400 whitespace-nowrap">
                ₹{product.price}
              </span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-500/80 mt-1">
                <Star size={10} fill="currentColor" />
                <span>{product.avgRating?.toFixed(1) || "0.0"}</span>
                <span className="text-slate-500 font-medium">({product.totalReviews || 0})</span>
              </div>
            </div>
          </div>
        {product.category && (
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full w-fit mb-2">
            {product.category}
          </span>
        )}
        {product.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3 flex-1">
            {product.description}
          </p>
        )}

        {/* Cart controls */}
        {inCart ? (
          <div className="flex items-center justify-between bg-slate-800 rounded-xl p-1 mt-auto">
            <button
              onClick={() => updateQuantity(product._id, inCart.quantity - 1)}
              className="w-8 h-8 bg-slate-700 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="text-white font-bold text-sm w-6 text-center">
              {inCart.quantity}
            </span>
            <button
              onClick={() => addToCart(product)}
              className="w-8 h-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center justify-center transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold py-2.5 rounded-xl transition-all mt-auto"
          >
            <Plus size={13} /> Add to Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
