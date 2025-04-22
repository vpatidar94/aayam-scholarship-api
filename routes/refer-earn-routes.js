const express = require("express");
const { addMultipleStudents, getAllStudents,} = require("../controllers/refer-earn-controller");

const router = express.Router();

router.post('/add-bulk',addMultipleStudents);
router.get('/get-students', getAllStudents);


module.exports = router;