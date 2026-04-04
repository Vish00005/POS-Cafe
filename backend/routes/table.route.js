import express from "express";
const router = express.Router();
import { getTables, createTable } from "../contollers/table.controller.js";

router.get("/", getTables);
router.post("/", createTable);

export default router;
