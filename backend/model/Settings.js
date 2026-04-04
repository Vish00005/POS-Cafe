import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    upiId:    { type: String, default: "" },
    upiName:  { type: String, default: "Smart Cafeteria" },
    cafeName: { type: String, default: "Smart Cafeteria" },
    currency: { type: String, default: "INR" },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
