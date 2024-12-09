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

const updateEmployeeUser = async (req, res) => {
    const userId = req.body.userId;
    const updatedData = req.body;
    try {
        const updatedEmployeeUser = await Employee.findByIdAndUpdate(userId, updatedData);

        if (!updatedEmployeeUser) {
            return res.status(404).json({
                code: 404,
                status_code: "not_found",
                message: "Employee not found"
            });
        }
        return res.status(201).json({ code: 201, status_code: "success", message: "Employee Updated Successfully" })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            status_code: "error",
            message: "Internal Server Error"
        });
    }
}

module.exports = {
    addEmployee,
    getAllEmployees,
    updateEmployeeUser
}