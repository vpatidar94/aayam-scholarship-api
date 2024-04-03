const express = require("express");
const { verifyToken, verifyAdminToken } = require("../middleware/jwt-token");
const { addEnquiryUser, getAllEnquiryUsers, updateEnquiryUser } = require("../controllers/enquiry-user-controller");

const router = express.Router();

router.post('/add', addEnquiryUser);
router.get('/all', getAllEnquiryUsers);
router.put('/update', updateEnquiryUser);

module.exports = router;