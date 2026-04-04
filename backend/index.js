import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
import authRoute from "./routes/auth.route.js";
import productRoute from "./routes/product.route.js";
import orderRoute from "./routes/order.route.js";
import tableRoute from "./routes/table.route.js";

const PORT = process.env.PORT || 3001;

app.get("/", (req, res) => {
  res.send("Api Running....");
});

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/table", tableRoute);
app.use("/api/v1/order", orderRoute);

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

app.listen(PORT, (req, res) => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit : http://localhost:${PORT}`);
});
