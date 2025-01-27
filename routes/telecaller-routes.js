const express = require("express");
const { addTelecaller } = require("../controllers/telecaller-controller");
const router = express.Router();

router.post('/add', addTelecaller);

module.exports = router;