const express = require("express");
const { signup, sendOTPMessage, signupOTP, getAllUsers, signinOTP, signin } = require("../controllers/user-controller");
const { verifyOTP } = require("../services/user-otp-service");
const { verifyToken } = require("../middleware/jwt-token");

const router = express.Router();

// public routes
router.put('/signup', signup);
router.post('/sendotp', sendOTPMessage);
router.post('/send-signup-otp', signupOTP);
router.post('/verifyotp', verifyOTP);

// private routes
router.get('/', getAllUsers)
router.post('/signin-otp', signinOTP);
router.post('/signin', signin)

module.exports = router;