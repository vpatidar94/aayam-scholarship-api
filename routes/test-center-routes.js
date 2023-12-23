const express = require("express");
const testCenter = require("../controllers/test-center-controller");
const router = express.Router();

router.post('/add', testCenter);

module.exports = router;