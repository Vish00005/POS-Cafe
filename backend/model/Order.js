// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: String,

    tableNumber: {
      type: Number,
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],

    status: {
      type: String,
      enum: ["pending", "preparing", "completed"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card"],
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "upi_pending", "upi_failed"],
      default: "pending",
    },

    totalAmount: Number,
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
