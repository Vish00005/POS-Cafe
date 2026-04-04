import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./model/User.js";
import Product from "./model/Product.js";
import Table from "./model/Table.js";
import Order from "./model/Order.js";
import Category from "./model/Category.js";
import Settings from "./model/Settings.js";

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/odoo_pos";

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected for Seeding"))
  .catch((err) => { console.error(err.message); process.exit(1); });

// ── Seed data ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Burgers", "Pizza", "Salads", "Beverages",
  "Desserts", "Snacks", "Mains", "Combos",
];

const PRODUCTS = [
  { name: "Classic Cheeseburger",   categories: ["Burgers"],    category: "Burgers",    price: 149, description: "Juicy beef patty with cheese, tomato and lettuce." },
  { name: "Double Smash Burger",    categories: ["Burgers"],    category: "Burgers",    price: 199, description: "Two crispy smash patties with special sauce." },
  { name: "Margherita Pizza",       categories: ["Pizza"],      category: "Pizza",      price: 249, description: "Classic pizza with fresh mozzarella and basil." },
  { name: "Chicken BBQ Pizza",      categories: ["Pizza"],      category: "Pizza",      price: 299, description: "Smoky BBQ chicken on a hand-tossed base." },
  { name: "Caesar Salad",           categories: ["Salads"],     category: "Salads",     price: 129, description: "Crisp romaine with Caesar dressing and croutons." },
  { name: "Greek Salad",            categories: ["Salads"],     category: "Salads",     price: 119, description: "Cucumber, olives, feta, and cherry tomatoes." },
  { name: "Coca-Cola",              categories: ["Beverages"],  category: "Beverages",  price: 49,  description: "Chilled can of Coca-Cola 330ml." },
  { name: "Mango Lassi",            categories: ["Beverages"],  category: "Beverages",  price: 79,  description: "Thick yoghurt mango shake." },
  { name: "Masala Chai",            categories: ["Beverages"],  category: "Beverages",  price: 39,  description: "Spiced Indian milk tea." },
  { name: "Chocolate Lava Cake",    categories: ["Desserts"],   category: "Desserts",   price: 99,  description: "Warm chocolate cake with a gooey molten center." },
  { name: "Gulab Jamun (2 pcs)",    categories: ["Desserts"],   category: "Desserts",   price: 69,  description: "Soft milk-solid dumplings in rose syrup." },
  { name: "French Fries",           categories: ["Snacks"],     category: "Snacks",     price: 79,  description: "Crispy golden fries with dipping sauce." },
  { name: "Onion Rings",            categories: ["Snacks"],     category: "Snacks",     price: 89,  description: "Beer-battered onion rings, served hot." },
  { name: "Grilled Chicken Platter",categories: ["Mains"],      category: "Mains",      price: 299, description: "Half grilled chicken with coleslaw and fries." },
  { name: "Paneer Butter Masala",   categories: ["Mains"],      category: "Mains",      price: 219, description: "Cottage cheese in rich tomato-butter gravy." },
  { name: "Dal Tadka + Rice",       categories: ["Mains"],      category: "Mains",      price: 179, description: "Yellow lentils with tempered spices over steamed rice." },
  { name: "Burger + Fries + Coke",  categories: ["Combos", "Burgers"], category: "Combos", price: 249, description: "Classic burger combo with fries and a chilled Coke." },
  { name: "Pizza + Salad Combo",    categories: ["Combos", "Pizza"],   category: "Combos", price: 329, description: "A personal pizza paired with a fresh salad." },
];

// Tables: 3 floors × 5 tables each
const buildTables = () => {
  const tables = [];
  for (let floor = 1; floor <= 3; floor++) {
    for (let num = 1; num <= 5; num++) {
      const tableNumber = (floor - 1) * 5 + num;
      tables.push({
        tableNumber,
        floor,
        seats: num % 2 === 0 ? 2 : 4,
        isOccupied: false,
        isActive: true,
        qrCode: `http://localhost:5173/menu?table=${tableNumber}`,
      });
    }
  }
  return tables;
};

// ── importData ─────────────────────────────────────────────────────────────────
const importData = async () => {
  try {
    console.log("🧹 Clearing existing data…");
    await Order.deleteMany();
    await Table.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Category.deleteMany();
    await Settings.deleteMany();

    // ── Users ──────────────────────────────────────────────────────────────
    const salt = await bcrypt.genSalt(10);
    const pw   = await bcrypt.hash("Password@123", salt);

    const users = await User.insertMany([
      { name: "Admin User",    email: "admin@example.com",    password: pw, role: "admin"    },
      { name: "Cashier User",  email: "cashier@example.com",  password: pw, role: "cashier"  },
      { name: "Kitchen User",  email: "kitchen@example.com",  password: pw, role: "kitchen"  },
      { name: "Priya Sharma",  email: "customer@example.com", password: pw, role: "customer" },
      { name: "Arjun Mehta",   email: "arjun@example.com",    password: pw, role: "customer" },
      { name: "Lakshmi Nair",  email: "lakshmi@example.com",  password: pw, role: "customer" },
    ]);
    console.log(`👤 ${users.length} users seeded.`);

    // ── Categories ──────────────────────────────────────────────────────────
    const catDocs = await Category.insertMany(CATEGORIES.map(name => ({ name })));
    console.log(`🏷️  ${catDocs.length} categories seeded.`);

    // ── Products ────────────────────────────────────────────────────────────
    const products = await Product.insertMany(
      PRODUCTS.map(p => ({ ...p, isAvailable: true }))
    );
    console.log(`🍔 ${products.length} products seeded.`);

    // ── Tables ──────────────────────────────────────────────────────────────
    const tables = await Table.insertMany(buildTables());
    console.log(`🪑 ${tables.length} tables seeded (3 floors × 5).`);

    // ── Settings (UPI placeholder) ──────────────────────────────────────────
    await Settings.create({
      upiId:    "cafeteria@upi",
      upiName:  "Smart Cafeteria",
      cafeName: "Smart Cafeteria",
      currency: "INR",
    });
    console.log("⚙️  Settings seeded.");

    // ── Sample orders (varied payment methods for dashboard charts) ──────────
    const customer1 = users[3];
    const customer2 = users[4];
    const customer3 = users[5];

    const orderSeeds = [
      // Cash orders
      {
        customer: customer1._id, table: tables[0], items: [products[0], products[11]],
        qty: [2, 1], method: "cash", payStatus: "pending",
      },
      {
        customer: customer2._id, table: tables[1], items: [products[12], products[6]],
        qty: [1, 2], method: "cash", payStatus: "paid",
      },
      // UPI orders
      {
        customer: customer1._id, table: tables[2], items: [products[2], products[9]],
        qty: [1, 1], method: "upi", payStatus: "paid",
      },
      {
        customer: customer3._id, table: tables[3], items: [products[16]],
        qty: [2], method: "upi", payStatus: "upi_pending",
      },
      // Card orders
      {
        customer: customer2._id, table: tables[4], items: [products[13], products[7]],
        qty: [1, 1], method: "card", payStatus: "paid",
      },
      {
        customer: customer3._id, table: tables[5], items: [products[4], products[8]],
        qty: [1, 2], method: "card", payStatus: "paid",
      },
    ];

    const orders = await Promise.all(
      orderSeeds.map(({ customer, table, items, qty, method, payStatus }, i) => {
        const orderItems = items.map((p, j) => ({
          productId: p._id, name: p.name, price: p.price, quantity: qty[j],
        }));
        const totalAmount = orderItems.reduce((s, it) => s + it.price * it.quantity, 0);
        return Order.create({
          orderNumber:   `ORD${Date.now()}${i}`,
          tableNumber:   table.tableNumber,
          customer,
          items:         orderItems,
          status:        payStatus === "paid" ? "preparing" : "pending",
          paymentMethod: method,
          paymentStatus: payStatus,
          totalAmount,
        });
      })
    );
    console.log(`📦 ${orders.length} sample orders seeded.`);

    console.log("\n✅ All data imported successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Demo credentials (password: Password@123)");
    console.log("  Admin   → admin@example.com");
    console.log("  Cashier → cashier@example.com");
    console.log("  Kitchen → kitchen@example.com");
    console.log("  Customer→ customer@example.com");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// ── destroyData ────────────────────────────────────────────────────────────────
const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Table.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Category.deleteMany();
    await Settings.deleteMany();
    console.log("🗑️  All data destroyed.");
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// ── Entry point ────────────────────────────────────────────────────────────────
if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
