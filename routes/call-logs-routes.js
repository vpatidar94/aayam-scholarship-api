const express = require("express");
const { addCallLog, addMultipleCallLog, getAllCallLogs,} = require("../controllers/call-logs-controller");

const router = express.Router();

router.post('/add', addCallLog);
router.post('/add-many',addMultipleCallLog);
router.get('/get-calllogs', getAllCallLogs);

module.exports = router;