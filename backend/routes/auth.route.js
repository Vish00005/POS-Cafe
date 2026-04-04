import express from "express";
const router = express.Router();
import {
  registerUser,
  loginUser,
  getMe,
} from "../contollers/auth.controller.js";

router.get("/sample", (req, res) => {
  res.send("Auth Smaple Route...");
});
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", getMe);

export default router;
