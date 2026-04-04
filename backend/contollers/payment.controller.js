import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/v1/payment/create-order
// Creates a Razorpay order — called BEFORE showing the checkout popup
export const createPaymentOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects paise (1 INR = 100 paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order); // returns { id, amount, currency, ... }
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    res.status(500).json({ message: error.message || "Payment initiation failed" });
  }
};
