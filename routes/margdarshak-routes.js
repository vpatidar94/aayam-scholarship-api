const express = require("express");
const { addMargdarshak, getAllMargdarshaks,updateMargdarshakUser } = require("../controllers/margdarshak-controller");
const router = express.Router();

router.post('/add', addMargdarshak);
router.get('/getAllMargdarshaks', getAllMargdarshaks);
router.put('/update', updateMargdarshakUser);

module.exports = router;