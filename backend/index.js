const express = require("express");
const app = express();

PORT = 3001;

app.get("/", (req, res) => {
  res.send("Api Running....");
});

app.listen(PORT, (req, res) => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit : http://localhost:${PORT}`);
});
