import express from "express";
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from "../contollers/order.controller.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/", protect, getOrders);
router.put("/:id/status", protect, authorize("kitchen"), updateOrderStatus);
router.put("/:id/payment", protect, authorize("cashier"), updatePaymentStatus);

export default router;
