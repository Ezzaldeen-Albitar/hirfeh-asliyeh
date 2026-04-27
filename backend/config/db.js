const mongoose = require("mongoose");

mongoose
  .connect('')
  .then(() => {
    console.log("DB Ready To Use");
  })
  .catch((err) => {
    console.log(err);
  });
