import Order from "../model/Order.js";

export const createOrder = async (req, res) => {
  try {
    const { tableNumber, items, paymentMethod, customer } = req.body;
    const totalAmount = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    const order = await Order.create({
      orderNumber: "ORD" + Date.now(),
      tableNumber,
      customer,
      items,
      paymentMethod,
      paymentStatus: paymentMethod === "cash" ? "pending" : "paid",
      totalAmount,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { status, paymentStatus } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

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
    const order = await Order.findById(req.params.id).populate(
      "customer",
      "name email",
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

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

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderSummary = async (req, res) => {
  try {
    const orders = await Order.find();
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (acc, order) =>
        order.paymentStatus === "paid" ? acc + order.totalAmount : acc,
      0,
    );

    const pendingPayments = orders.filter(
      (order) => order.paymentStatus === "pending",
    ).length;

    res.json({
      totalOrders,
      totalRevenue,
      pendingPayments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
