import { useState, useEffect } from "react";
import { Star, X, MessageSquare } from "lucide-react";
import api from "../services/api";
import Spinner from "./Spinner";

const ProductReviewsModal = ({ product, onClose }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/api/v1/review/${product._id}`)
      .then(({ data }) => setReviews(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [product._id]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-100 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden pb-16 sm:pb-0">
        <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-white/5 shrink-0 overflow-hidden">
              <img
                src={product.img}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-sm font-black text-white leading-tight uppercase tracking-tight">
                {product.name}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="flex text-yellow-400">
                  <Star size={10} fill="currentColor" />
                </div>
                <span className="text-[10px] font-bold text-white">
                  {product.avgRating?.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-500">
                  ({product.totalReviews})
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Reviews List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner size="sm" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare size={20} className="text-slate-600" />
              </div>
              <p className="text-slate-400 text-xs font-semibold italic">
                No community feedback for this dish yet.
              </p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev._id}
                className="space-y-2 pb-4 border-b border-white/5 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-indigo-500/10 rounded-full flex items-center justify-center text-[8px] font-bold text-indigo-400 uppercase">
                      {rev.customer?.name?.charAt(0) || "C"}
                    </div>
                    <span className="text-[10px] font-black text-slate-200">
                      {rev.customer?.name || "Customer"}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-500">
                    {formatDate(rev.createdAt)}
                  </span>
                </div>
                <div className="flex gap-0.5 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={9}
                      fill={i < rev.rating ? "currentColor" : "none"}
                      strokeWidth={i < rev.rating ? 0 : 2}
                    />
                  ))}
                </div>
                {rev.comment && (
                  <p className="text-xs text-slate-400 leading-relaxed italic bg-white/5 p-2 rounded-lg border-l-2 border-indigo-500/30">
                    "{rev.comment}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 shrink-0 bg-slate-900">
          <button
            onClick={onClose}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductReviewsModal;
