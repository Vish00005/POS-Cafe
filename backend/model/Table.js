import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      unique: true,
    },
    seats: Number,
    floor: {
      type: Number,
      default: 1,
    },
    qrCode: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    isOccupied: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Table", tableSchema);
