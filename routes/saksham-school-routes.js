const express = require("express");
const { addSakshamSchool, getAllSakshamSchools } = require("../controllers/saksham-school-controller");
const router = express.Router();

router.post('/add', addSakshamSchool);
router.get('/getAllSakshamSchools', getAllSakshamSchools);

module.exports = router;