import express from "express";
import { createPaymentOrder } from "../contollers/payment.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only authenticated users can initiate payment
router.post("/create-order", protect, createPaymentOrder);

export default router;
