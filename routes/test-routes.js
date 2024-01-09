const express = require("express");
const { verifyToken, verifyAdminToken } = require("../middleware/jwt-token");
const { addTest, submitResult, getTestDetail, deleteTest, getTestByStream, getAllTests } = require("../controllers/test-controller");
const router = express.Router();

// protected routes
router.get("/getTestDetail/:stream", verifyToken, getTestDetail);
router.post("/submitResult", verifyToken, submitResult);
router.get("/getTest/:stream", verifyToken, getTestByStream);

// admin routes
router.post("/addTest", verifyAdminToken, addTest);
router.get("/alltests", verifyAdminToken, getAllTests)
router.delete("/deleteTest/:id", deleteTest)
module.exports = router;