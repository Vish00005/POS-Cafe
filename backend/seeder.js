import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./model/User.js";
import Product from "./model/Product.js";
import Table from "./model/Table.js";
import Order from "./model/Order.js";

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/odoo_pos";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected for Seeding"))
  .catch((err) => {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  });

const importData = async () => {
  try {
    // Clear existing data
    await Order.deleteMany();
    await Table.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    // Hash dummy password for users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Password@123", salt);

    // Seed Users
    const users = await User.insertMany([
      {
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        employeeId: "EMP-001",
        role: "admin",
      },
      {
        name: "Cashier User",
        email: "cashier@example.com",
        password: hashedPassword,
        employeeId: "EMP-002",
        role: "cashier",
      },
      {
        name: "Kitchen User",
        email: "kitchen@example.com",
        password: hashedPassword,
        employeeId: "EMP-003",
        role: "kitchen",
      },
      {
        name: "Customer User",
        email: "customer@example.com",
        password: hashedPassword,
        role: "customer",
      },
    ]);

    console.log("Users seeded.");

    const tables = await Table.insertMany([
      {
        tableNumber: 1,
        seats: 4,
        qrCode: "http://localhost:5173/menu?table=1",
      },
      {
        tableNumber: 2,
        seats: 2,
        qrCode: "http://localhost:5173/menu?table=2",
      },
      {
        tableNumber: 3,
        seats: 6,
        qrCode: "http://localhost:5173/menu?table=3",
      },
      {
        tableNumber: 4,
        seats: 4,
        qrCode: "http://localhost:5173/menu?table=4",
      },
    ]);

    console.log("Tables seeded.");

    const products = await Product.insertMany([
      {
        name: "Classic Cheeseburger",
        category: "Burgers",
        price: 8.99,
        description: "Juicy beef patty with cheese, tomato, and lettuce.",
      },
      {
        name: "Margherita Pizza",
        category: "Pizza",
        price: 12.99,
        description: "Classic pizza with fresh mozzarella and basil.",
      },
      {
        name: "Caesar Salad",
        category: "Salads",
        price: 6.99,
        description: "Crisp romaine with Caesar dressing and croutons.",
      },
      {
        name: "Coca-Cola",
        category: "Beverages",
        price: 2.5,
        description: "Chilled can of Coca-Cola.",
      },
      {
        name: "Chocolate Lava Cake",
        category: "Desserts",
        price: 5.99,
        description: "Warm chocolate cake with a gooey center.",
      },
    ]);

    console.log("Products seeded.");

    const order = await Order.create({
      orderNumber: "ORD" + Date.now(),
      tableNumber: tables[0].tableNumber,
      customer: users[3]._id,
      items: [
        {
          productId: products[0]._id,
          name: products[0].name,
          price: products[0].price,
          quantity: 2,
        },
        {
          productId: products[3]._id,
          name: products[3].name,
          price: products[3].price,
          quantity: 2,
        },
      ],
      status: "pending",
      paymentMethod: "cash",
      paymentStatus: "pending",
      totalAmount: products[0].price * 2 + products[3].price * 2,
    });

    console.log("Initial Orders seeded.");

    console.log("All Data Imported Successfully!");
    process.exit();
  } catch (error) {
    console.error(`Error importing data: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Table.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log("Data Destroyed!");
    process.exit();
  } catch (error) {
    console.error(`Error destroying data: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
