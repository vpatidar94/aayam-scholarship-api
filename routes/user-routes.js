const express = require("express");
const { signup, sendOTPMessage, signupOTP, getAllUsers, signinOTP, signin, getUserById, generateSingleEnrollmentNo, generateAllEnrollmentNo, findUserByMobileNo, getAllUsersByStream, updateOfflineResults, generateRankByStream, getAllUsersByClass, generateRankByClass, sendWpMessageByClass, calculateNormalizedScores } = require("../controllers/user-controller");
const { verifyOTP } = require("../services/user-otp-service");
const { verifyToken, verifyAdminToken } = require("../middleware/jwt-token");

const router = express.Router();

// public routes
router.put('/signup', signup);
router.post('/sendotp', sendOTPMessage);
router.post('/send-signup-otp', signupOTP);
router.post('/verifyotp', verifyOTP);
router.post('/user-by-mobileNo', findUserByMobileNo);
router.post('/update-offline-results', updateOfflineResults)
// private routes
router.get('/', verifyAdminToken, getAllUsers);
router.get('/user', verifyToken, getUserById); // /{:id}
router.post('/signin-otp', signinOTP);
router.post('/signin', signin);
router.put('/generate-enrolNo', generateSingleEnrollmentNo);
router.put ('/genrate-all-enrolNo', generateAllEnrollmentNo);
router.get('/details/:stream', verifyAdminToken, getAllUsersByStream); // /stream/:stream
router.post('/generate-rank', generateRankByStream)
router.post('/result-by-class', getAllUsersByClass) // /result/class
router.post('/rank-by-class', generateRankByClass)
router.post("/send-rank-msg-by-class", sendWpMessageByClass);
router.post('/generate-normalized-score', calculateNormalizedScores);


module.exports = router;