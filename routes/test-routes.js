const express = require("express");
const { verifyToken, verifyAdminToken } = require("../middleware/jwt-token");
const { addTest, getTest, submitResult, getAllTest, getTestDetail, deleteTest, getTestByStream } = require("../controllers/test-controller");
const router = express.Router();

// protected routes
router.get("/getTest/:testId", verifyToken, getTest);
router.get("/getTestDetail/:testId", verifyToken, getTestDetail);
router.post("/submitResult", verifyToken, submitResult);
router.get("/:stream", getTestByStream);

// admin routes
router.post("/addTest", verifyAdminToken, addTest);
router.get("/getAllTest", verifyAdminToken, getAllTest);
router.delete("/deleteTest/:id", deleteTest)
module.exports = router;