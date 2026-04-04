// models/Table.js
import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      unique: true,
    },
    seats: Number,

    qrCode: String, // store QR URL or base64

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Table", tableSchema);
