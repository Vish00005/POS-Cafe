import express from "express";
import { getSettings, updateSettings } from "../contollers/settings.controller.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getSettings); // public — customers need the UPI ID to show QR
router.put("/", protect, authorize("admin"), updateSettings);

export default router;
