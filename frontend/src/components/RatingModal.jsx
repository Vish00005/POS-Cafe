import { useState } from "react";
import { Star, X, Check } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

const RatingModal = ({ order, onClose, onSuccess }) => {
  const [ratings, setRatings] = useState(
    order.items.map((item) => ({
      productId: item.productId || item._id, // item.productId if populated, item._id if not
      name: item.name,
      rating: 5,
      comment: "",
    }))
  );
  const [submitting, setSubmitting] = useState(false);

  const updateItemRating = (index, rating) => {
    const newRatings = [...ratings];
    newRatings[index].rating = rating;
    setRatings(newRatings);
  };

  const updateItemComment = (index, comment) => {
    const newRatings = [...ratings];
    newRatings[index].comment = comment;
    setRatings(newRatings);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post("/api/v1/review", {
        orderId: order._id,
        reviews: ratings,
      });
      toast.success("Thank you for your feedback!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit reviews");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-tight">Rate your items</h2>
            <p className="text-[10px] font-bold text-indigo-400 mt-0.5 uppercase tracking-widest">Share your experience</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-8 scrollbar-hide">
          {ratings.map((item, index) => (
            <div key={index} className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-black text-white uppercase tracking-wider truncate">{item.name}</span>
                <div className="flex gap-1 shrink-0">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => updateItemRating(index, star)}
                      className={`transition-all duration-200 ${
                        star <= item.rating
                          ? "text-yellow-400 scale-110"
                          : "text-slate-700 hover:text-slate-500"
                      }`}
                    >
                      <Star size={20} fill={star <= item.rating ? "currentColor" : "none"} strokeWidth={star <= item.rating ? 0 : 2} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <input
                    type="text"
                    placeholder="Tell us what you liked..."
                    value={item.comment}
                    onChange={(e) => updateItemComment(index, e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Action */}
        <div className="p-6 border-t border-slate-800 shrink-0 bg-slate-900/80">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
          >
            {submitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check size={18} />
                Submit Feedback
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
