const express = require("express");
const { verifyToken, verifyAdminToken } = require("../middleware/jwt-token");
const { getResultDashboard, generateRank, getResultByTest, getAllScorePoints, sendWpMessage, getAllResultsDetails, getTestResultByUser } = require("../controllers/result-controller");
const router = express.Router();

// protected routes
router.get("/getResultDashboard", verifyToken, getResultDashboard);
router.get("/getAllScorePoints", verifyToken, getAllScorePoints);
router.get("/getTestResultByUser/:testId",verifyToken, getTestResultByUser);

// for admin users
router.get("/generateRank/:testId", verifyAdminToken, generateRank);
router.get("/getResultByTest/:testId", verifyAdminToken, getResultByTest);
router.get("/getAllResultsDetails",verifyAdminToken, getAllResultsDetails);
router.post("/sendWpMessage", verifyAdminToken, sendWpMessage);
module.exports = router;