const express = require("express");
const { signup, sendOTPMessage, signupOTP, getAllUsers, signinOTP, signin, getUserById, generateSingleEnrollmentNo, generateAllEnrollmentNo } = require("../controllers/user-controller");
const { verifyOTP } = require("../services/user-otp-service");
const { verifyToken, verifyAdminToken } = require("../middleware/jwt-token");

const router = express.Router();

// public routes
router.put('/signup', signup);
router.post('/sendotp', sendOTPMessage);
router.post('/send-signup-otp', signupOTP);
router.post('/verifyotp', verifyOTP);

// private routes
router.get('/', verifyAdminToken, getAllUsers);
router.get('/user', verifyToken, getUserById);
router.post('/signin-otp', signinOTP);
router.post('/signin', signin);
router.put('/generate-enrolNo', generateSingleEnrollmentNo);
router.put ('/genrate-all-enrolNo', generateAllEnrollmentNo);

module.exports = router;