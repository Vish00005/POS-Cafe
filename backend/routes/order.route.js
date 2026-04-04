import express from "express";
import {
  createOrder, getOrders, getOrderById,
  updateOrderStatus, updatePaymentStatus,
  confirmUpiPayment, getAnalytics, getOrderSummary,
} from "../contollers/order.controller.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/analytics", protect, authorize("admin"), getAnalytics);
router.get("/summary",   protect, authorize("admin", "cashier"), getOrderSummary);
router.get("/",          protect, getOrders);
router.post("/",         protect, createOrder);
router.get("/:id",       protect, getOrderById);
router.put("/:id/status",   protect, authorize("kitchen", "admin"), updateOrderStatus);
router.put("/:id/payment",  protect, authorize("cashier", "admin"), updatePaymentStatus);
router.put("/:id/upi-confirm", protect, authorize("cashier", "admin"), confirmUpiPayment);

export default router;
