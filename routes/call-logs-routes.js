const express = require("express");
const { addCallLog, addMultipleCallLog } = require("../controllers/call-logs-controller");

const router = express.Router();

router.post('/add', addCallLog);
router.post('add-many',addMultipleCallLog);

module.exports = router;