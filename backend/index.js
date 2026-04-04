import "dotenv/config"; // ESM-safe: loads .env before anything else
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.config.js";
import authRoute from "./routes/auth.route.js";
import productRoute from "./routes/product.route.js";
import orderRoute from "./routes/order.route.js";
import tableRoute from "./routes/table.route.js";
import paymentRoute from "./routes/payment.route.js";
import settingsRoute from "./routes/settings.route.js";
import categoryRoute from "./routes/category.route.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to database
connectDB();

// ── Middleware ──
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", process.env.CLIENT_URL].filter(Boolean),
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// ── Routes ──
app.get("/", (req, res) => {
  res.send("Api Running....");
});

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/table", tableRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/settings", settingsRoute);
app.use("/api/v1/category", categoryRoute);

app.get("/api/v1/logout", (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.json({ message: "Logged out successfully" });
});

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

// ── Global Error Handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit : http://localhost:${PORT}`);
});
