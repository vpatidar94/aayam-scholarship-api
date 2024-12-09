const express = require("express");
const { addEmployee, getAllEmployees, updateEmployeeUser } = require("../controllers/employee-controller");
const router = express.Router();

router.post('/add', addEmployee);
router.get('/getAllEmployees', getAllEmployees);
router.put('/update', updateEmployeeUser);

module.exports = router;