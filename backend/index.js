require("dotenv").config();
const express = require("express");
const app = express();
const authRoute = require("./routes/auth.route.js");
const productRoute = require("./routes/product.route.js");
const orderRoute = require("./routes/order.route.js");
const tableRoute = require("./routes/table.route.js");

PORT = process.env.PORT || 3001;

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
