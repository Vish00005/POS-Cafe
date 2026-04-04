import Order from "../model/Order.js";
import { occupyTableByNumber } from "./table.controller.js";

export const createOrder = async (req, res) => {
  try {
    const { tableNumber, items, paymentMethod, customer } = req.body;
    const totalAmount = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

    // UPI orders start as upi_pending — cashier must confirm before kitchen gets them
    const paymentStatus =
      paymentMethod === "cash" ? "pending" :
      paymentMethod === "upi"  ? "upi_pending" :
      "paid"; // card → Razorpay already paid

    const order = await Order.create({
      orderNumber: "ORD" + Date.now(),
      tableNumber,
      customer,
      items,
      paymentMethod,
      paymentStatus,
      totalAmount,
    });

    // Mark table occupied for cash/card immediately; for UPI, mark after confirmation
    if (paymentMethod !== "upi") {
      await occupyTableByNumber(tableNumber);
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { status, paymentStatus, paymentMethod, customer } = req.query;
    let filter = {};
    if (status)        filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (customer)      filter.customer = customer;

    const orders = await Order.find(filter)
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("customer", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.paymentStatus = paymentStatus;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/v1/order/:id/upi-confirm
// Cashier confirms or rejects a UPI payment
export const confirmUpiPayment = async (req, res) => {
  try {
    const { action } = req.body; // 'approve' | 'reject'
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (action === "approve") {
      order.paymentStatus = "paid";
      await occupyTableByNumber(order.tableNumber); // mark table occupied now
    } else {
      order.paymentStatus = "upi_failed";
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/v1/order/analytics — 7-day revenue, status distribution, payment method
export const getAnalytics = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: 1 });

    // Last 7 days revenue
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });

    const revenueByDay = days.map((day) => ({
      day: new Date(day).toLocaleDateString("en-IN", { weekday: "short" }),
      revenue: orders
        .filter(o => o.createdAt.toISOString().slice(0, 10) === day && o.paymentStatus === "paid")
        .reduce((s, o) => s + o.totalAmount, 0),
      orders: orders.filter(o => o.createdAt.toISOString().slice(0, 10) === day).length,
    }));

    const statusBreakdown = [
      { name: "Pending",   value: orders.filter(o => o.status === "pending").length,   fill: "#f59e0b" },
      { name: "Preparing", value: orders.filter(o => o.status === "preparing").length, fill: "#6366f1" },
      { name: "Completed", value: orders.filter(o => o.status === "completed").length, fill: "#22c55e" },
    ];

    const paymentBreakdown = [
      { name: "Cash",      value: orders.filter(o => o.paymentMethod === "cash").length },
      { name: "UPI",       value: orders.filter(o => o.paymentMethod === "upi").length },
      { name: "Card",      value: orders.filter(o => o.paymentMethod === "card").length },
    ];

    const totalRevenue = orders.filter(o => o.paymentStatus === "paid").reduce((s, o) => s + o.totalAmount, 0);

    res.json({ revenueByDay, statusBreakdown, paymentBreakdown, totalOrders: orders.length, totalRevenue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderSummary = async (req, res) => {
  try {
    const orders = await Order.find();
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(o => o.paymentStatus === "paid")
      .reduce((acc, o) => acc + o.totalAmount, 0);
    const pendingPayments = orders.filter(o => o.paymentStatus === "pending").length;
    res.json({ totalOrders, totalRevenue, pendingPayments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
