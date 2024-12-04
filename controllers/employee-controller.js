const Employee = require('../models/employee-user');

const addEmployee = async (req, res) => {
    const data = req.body;
    const { mobileNo } = data

    try {
        const existingUser = await Employee.findOne({ mobileNo });
        if (existingUser) {
            return res.status(400).json({ code: 400, status_code: "error", message: "User already exists" });
        }

        const newEmployee = new Employee({
            ...data
        })
        const savedEmployee = await newEmployee.save();
        return res.status(200).json({ data: savedEmployee, code: 200, status_code: "success", message: "data saved successfully" })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, status_code: "error", message: "something Went Wrong" })
    }
}

const getAllEmployees = async (req, res) => {
    try {
        const allEmployees = await Employee.find();

        return res.status(200).json({ data: allEmployees, code: 200, status_code: "success", message: "Employees fetched successfully" })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, status_code: "error", message: "something went wrong" })
    }
}

module.exports = {
    addEmployee,
    getAllEmployees
}