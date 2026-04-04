import "dotenv/config";
import mongoose from "mongoose";
import Product from "./model/Product.js";

const MONGO_URL = process.env.MONGO_URL;

const seedRatings = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to MongoDB for Rating Seed");

    const products = await Product.find();
    console.log(`🔍 Found ${products.length} products to update...`);

    for (const p of products) {
      // Generate random demo stats
      const randomAvg = 4.2 + (Math.random() * 0.7); // 4.2 to 4.9
      const randomCount = Math.floor(8 + Math.random() * 15); // 8 to 22 reviews
      
      p.avgRating = randomAvg;
      p.totalReviews = randomCount;
      
      await p.save();
      console.log(`⭐⭐ Updated "${p.name}" -> ${randomAvg.toFixed(1)} ★ (${randomCount} reviews)`);
    }

    console.log("\n✨ Demo ratings added successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding ratings:", err.message);
    process.exit(1);
  }
};

seedRatings();
