const express = require("express");
const { addTelecaller, getTelecallers } = require("../controllers/telecaller-controller");
const router = express.Router();

router.post('/add', addTelecaller);
router.get('/all', getTelecallers);

module.exports = router;