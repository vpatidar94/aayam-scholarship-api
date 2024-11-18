const sakshamSchool = require('../models/saksham-school-user');

const addSakshamSchool = async (req, res) => {
    const data = req.body;
    const { mobileNo } = data

    try {
        const existingUser = await sakshamSchool.findOne({ mobileNo });
        if (existingUser) {
            return res.status(400).json({ code: 400, status_code: "error", message: "User already exists" });
        }

        const newSakshamSchool = new sakshamSchool({
            ...data
        })
        const savedSakshamSchool = await newSakshamSchool.save();
        return res.status(200).json({ data: savedSakshamSchool, code: 200, status_code: "success", message: "data saved successfully" })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, status_code: "error", message: "something Went Wrong" })
    }
}

const getAllSakshamSchools = async (req, res) => {
    try {
        const allSakshamSchools = await sakshamSchool.find();

        return res.status(200).json({ data: allSakshamSchools, code: 200, status_code: "success", message: "saksham schools fetched successfully" })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, status_code: "error", message: "something went wrong" })
    }
}

module.exports = {
    addSakshamSchool,
    getAllSakshamSchools
}