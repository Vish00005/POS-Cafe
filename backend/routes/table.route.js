import express from "express";
import { getTables, createTable, setTableStatus } from "../contollers/table.controller.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getTables);
router.post("/", protect, authorize("admin", "cashier"), createTable);
router.put("/:id/status", protect, authorize("admin", "cashier"), setTableStatus);

export default router;
