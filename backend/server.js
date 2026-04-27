const express = require("express");
const app = express();
const db = require("./models/db");
app.use(express.json());




const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Example application listening at http://localhost:${PORT}`);
});