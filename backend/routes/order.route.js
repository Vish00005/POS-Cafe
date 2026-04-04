const express = require("express");
const router = express.Router();

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.put("/:id/status", updateOrderStatus);
router.put("/:id/payment", updatePaymentStatus);

module.exports = router;
