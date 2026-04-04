import { useCart } from "../context/CartContext";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";

const ProductCard = ({ product }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const inCart = cart.find((i) => i._id === product._id);

  const handleAdd = () => {
    addToCart(product);
    toast.success(`${product.name} added!`, { duration: 800, icon: "🛒" });
  };

  return (
    <div className="glass rounded-2xl overflow-hidden card-hover flex flex-col group">
      {/* Image */}
      <div className="relative h-36 bg-slate-800/80 flex items-center justify-center overflow-hidden">
        <img
          src={
            product.img ||
            "https://cdn-icons-png.flaticon.com/128/8633/8633559.png"
          }
          alt={product.name}
          className="w-24 h-24 object-contain group-hover:scale-110 transition-transform duration-300"
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
          <span className="text-sm font-bold text-indigo-400 whitespace-nowrap">
            ₹{product.price}
          </span>
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
