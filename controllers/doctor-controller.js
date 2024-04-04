const Doctor = require('../models/doctor-user');

const addDoctor = async (req, res) => {
    const data = req.body;
    const { mobileNo } = data

    try {
        const existingUser = await Doctor.findOne({ mobileNo });
        if (existingUser) {
            return res.status(400).json({ code: 400, status_code: "error", message: "User already exists" });
        }

        const newDoctor = new Doctor({
            ...data
        })
        const savedDoctor = await newDoctor.save();
        return res.status(200).json({ data: savedDoctor, code: 200, status_code: "success", message: "data saved successfully" })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, status_code: "error", message: "something Went Wrong" })
    }
}

const getAllDoctors = async (req, res) => {
    try {
        const allDoctors = await Doctor.find();

        return res.status(200).json({ data: allDoctors, code: 200, status_code: "success", message: "Doctors fetched successfully" })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, status_code: "error", message: "something went wrong" })
    }
}

module.exports = {
    addDoctor,
    getAllDoctors
}