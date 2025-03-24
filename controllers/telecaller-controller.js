const Lead = require("../models/lead-user");
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


const getTelecallers = async (req, res) => {
    try {
        // Fetch all telecallers
        const telecallers = await Telecaller.find({}, '_id name dailyQuota isAbsent');

        // Map through telecallers and count pending leads for each
        const telecallersData = await Promise.all(
            telecallers.map(async (telecaller) => {
                const pendingLeadsCount = await Lead.countDocuments({
                    assignedTo: telecaller._id,
                    pending: true
                });

                return {
                    telecallerId: telecaller._id,
                    name: telecaller.name,
                    dailyQuota: telecaller.dailyQuota,
                    isAbsent: telecaller.isAbsent,
                    pendingLeadsCount
                };
            })
        );

        res.status(200).json({
            code: 200,
            status_code: "success",
            data: telecallersData,
            message: 'Telecallers retrieved successfully.'
        });

    }
    catch (error) {
        console.error('Error fetching telecallers:', error);
        res.status(500).json({
            code: 500,
            status_code: "error",
            message: 'Failed to retrieve telecallers.',
            error: error.message
        });
    }
};

module.exports = {
    addTelecaller,
    getTelecallers,
}