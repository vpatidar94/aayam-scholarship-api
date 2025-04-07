const express = require("express");
const { addCallLog } = require("../controllers/call-logs-controller");

const router = express.Router();

router.post('/add', addCallLog);

module.exports = router;