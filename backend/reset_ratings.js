import "dotenv/config";
import mongoose from "mongoose";
import Product from "./model/Product.js";

const MONGO_URL = process.env.MONGO_URL;

const resetRatings = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to MongoDB for Rating Reset");

    const result = await Product.updateMany(
      {}, 
      { $set: { avgRating: 0, totalReviews: 0 } }
    );
    
    console.log(`✨ Successfully reset ratings for ${result.modifiedCount} products.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error resetting ratings:", err.message);
    process.exit(1);
  }
};

resetRatings();
