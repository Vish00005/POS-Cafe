import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: String,
    category:   { type: String, default: "" },      // legacy single value kept for compatibility
    categories: { type: [String], default: [] },     // new multi-select
    price: Number,
    description: String,
    img: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/128/8633/8633559.png",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Product", productSchema);
