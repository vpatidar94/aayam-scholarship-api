const express = require("express");
const { addMargdarshak, getAllMargdarshaks } = require("../controllers/margdarshak-controller");
const router = express.Router();

router.post('/add', addMargdarshak);
router.get('/all', getAllMargdarshaks);

module.exports = router;