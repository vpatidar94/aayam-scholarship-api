const express = require("express");
const { addDoctor, getAllDoctors } = require("../controllers/doctor-controller");
const router = express.Router();

router.post('/add', addDoctor);
router.get('/all', getAllDoctors);

module.exports = router;