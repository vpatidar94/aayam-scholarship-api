const Telecaller = require("../models/telecaller-model");

const addTelecaller = async (req, res) => {
    const data = req.body;
    const { mobileNo } = data
    console.log(mobileNo)
    try {
        const existingTelecaller = await Telecaller.findOne({ mobileNo });
        console.log(existingTelecaller)
        if (existingTelecaller) {
            return res.status(400).json({ code: 400, status_code: "error", message: " Telecaller already exists" });
        }

        const newTelecaller = new Telecaller({
            ...data
        })
        const savedTelecaller = await newTelecaller.save();
        return res.status(200).json({ data: savedTelecaller, code: 200, status_code: "success", message: "data saved successfully" })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, status_code: "error", message: "something Went Wrong" })
    }
}

module.exports = {
    addTelecaller,
}