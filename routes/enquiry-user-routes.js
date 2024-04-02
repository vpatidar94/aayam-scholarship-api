const express = require("express");
const { verifyToken, verifyAdminToken } = require("../middleware/jwt-token");
const { addEnquiryUser, getAllEnquiryUsers } = require("../controllers/enquiry-user-controller");

const router = express.Router();

router.post('/add', addEnquiryUser);
router.get('/all', getAllEnquiryUsers);

module.exports = router;