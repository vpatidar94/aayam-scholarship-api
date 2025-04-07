const express = require("express");
const mongoose = require("mongoose");
require('dotenv').config();
const app = express();
const cors = require('cors');

const userRouter = require("./routes/user-routes");
const testCenterRouter = require("./routes/test-center-routes");
const testRouter = require("./routes/test-routes");
const resultRouter = require("./routes/result-routes");
const enquiryUserRouter = require("./routes/enquiry-user-routes");
const doctorRouter = require("./routes/doctor-routes");
const margdarshakRouter = require("./routes/margdarshak-routes");
const employeeRouter = require("./routes/employee-routes");
const leadUserRouter = require("./routes/lead-user-routes");
const telecallerRouter = require("./routes/telecaller-routes");
const callLogsRouter = require("./routes/call-logs-routes");

app.use(express.json());

// Use the CORS handler --------
const allowedOrigins = ['http://localhost:4400','http://localhost:4200', 'https://scholarship-web-gcqrn.ondigitalocean.app', 'https://jeet.aayamcareerinstitute.com', 'https://aset.aayamcareerinstitute.com', 'https://saksham-web-baurb.ondigitalocean.app','https://saksham.aayamcareerinstitute.com'];
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
app.use("/test-center", cors(corsOptions), testCenterRouter);
app.use("/test", cors(corsOptions), testRouter);
app.use("/result", cors(corsOptions), resultRouter);
app.use("/enquiry", cors(corsOptions), enquiryUserRouter);
app.use("/doctor", cors(corsOptions), doctorRouter);
app.use("/margdarshak", cors(corsOptions), margdarshakRouter);
app.use("/employee", cors(corsOptions), employeeRouter);
app.use("/lead", cors(corsOptions), leadUserRouter);
app.use("/telecaller", cors(corsOptions), telecallerRouter);
app.use("/callLog", cors(corsOptions), callLogsRouter);

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