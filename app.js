const express = require("express");
const mongoose = require("mongoose");
require('dotenv').config();
const app = express();
const cors = require('cors');

const userRouter = require("./routes/user-routes");
const testCenterRouter = require("./routes/test-center-routes")

app.use(express.json());

// Use the CORS handler --------
const allowedOrigins = ['*'];
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}

// Routings -------
app.use("/users", cors(corsOptions), userRouter);
app.use("/test-center",cors(corsOptions),testCenterRouter);

// Mongoose connection ----------
const databaseURL = process.env.DATABASE_URL;
const port = process.env.PORT || 5002;
mongoose.connect(
  databaseURL
).then(() =>
  app.listen(port, () => {
    console.log(`connected on ${port}`)
  })
).catch((err) => {
  console.log("mongoose error:", err);
})

// handle CORS
app.options('*', cors());