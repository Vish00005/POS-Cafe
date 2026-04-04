import Review from "../model/Review.js";
import Product from "../model/Product.js";
import Order from "../model/Order.js";

export const createOrderReviews = async (req, res) => {
  try {
    const { orderId, reviews } = req.body; // reviews: [{ productId, rating, comment }]
    const customer = req.user.id;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.reviewedAt) return res.status(400).json({ message: "Order already reviewed" });
    if (order.status !== "completed") return res.status(400).json({ message: "Can only review completed orders" });

    // Save each product review
    const savedReviews = await Promise.all(
      reviews.map(async (rev) => {
        const newReview = await Review.create({
          product: rev.productId,
          order: orderId,
          customer,
          rating: rev.rating,
          comment: rev.comment || "",
        });

        // Update Product stats
        const product = await Product.findById(rev.productId);
        if (product) {
          const totalRatingPoints = product.avgRating * product.totalReviews;
          product.totalReviews += 1;
          product.avgRating = (totalRatingPoints + rev.rating) / product.totalReviews;
          await product.save();
        }

        return newReview;
      })
    );

    // Mark order as reviewed
    order.reviewedAt = new Date();
    await order.save();

    res.status(201).json({ message: "Reviews submitted successfully", count: savedReviews.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReviewStats = async (req, res) => {
  try {
    const products = await Product.find({ totalReviews: { $gt: 0 } })
      .sort({ avgRating: -1 })
      .select("name avgRating totalReviews img category");

    const topRated = products.slice(0, 5);
    const lowRated = [...products].sort((a,b) => a.avgRating - b.avgRating).slice(0, 5);

    res.json({ topRated, lowRated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId })
      .populate("customer", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
