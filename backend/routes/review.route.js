import express from "express";
import { createOrderReviews, getReviewStats, getProductReviews } from "../contollers/review.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrderReviews);
router.get("/stats", getReviewStats);
router.get("/:productId", getProductReviews);

export default router;
