const express = require("express");
const router = express.Router();

router.get("/sample", (req, res) => {
  res.send("Auth Smaple Route...");
});
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", getMe);

module.exports = router;
