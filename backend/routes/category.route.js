import express from "express";
import { getCategories, createCategory, deleteCategory } from "../contollers/category.controller.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/",        getCategories);                                       // public — menu page filters need it
router.post("/",       protect, authorize("admin"), createCategory);
router.delete("/:id",  protect, authorize("admin"), deleteCategory);

export default router;
