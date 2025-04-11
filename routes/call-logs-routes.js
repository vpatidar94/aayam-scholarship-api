const express = require("express");
const { addCallLog, addMultipleCallLog, getAllCallLogs, updateCallLog,} = require("../controllers/call-logs-controller");

const router = express.Router();

router.post('/add', addCallLog);
router.post('/add-many',addMultipleCallLog);
router.get('/get-calllogs', getAllCallLogs);
router.put('/update-call-log', updateCallLog);


module.exports = router;