const express = require("express");
const router = express.Router();

router.get("/", getTables);
router.post("/", createTable);

module.exports = router;
