const express = require("express");
const { signup, sendOTPMessage, signupOTP } = require("../controllers/user-controller");
const { verifyOTP } = require("../services/user-otp-service");

const router = express.Router();

// public routes
router.put('/signup', signup);
router.post('/sendotp', sendOTPMessage);
router.post('/send-signup-otp', signupOTP);
router.post('/verifyotp', verifyOTP);

module.exports = router;