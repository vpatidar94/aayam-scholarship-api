const express = require("express");
const { addEmployee, getAllEmployees } = require("../controllers/employee-controller");
const router = express.Router();

router.post('/add', addEmployee);
router.get('/getAllEmployees', getAllEmployees);

module.exports = router;