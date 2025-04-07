const Margdarshak = require('../models/margdarshak-user');

const addMargdarshak = async (req, res) => {
    const data = req.body;
    const { mobileNo } = data

    try {
        const existingUser = await Margdarshak.findOne({ mobileNo });
        if (existingUser) {
            return res.status(400).json({ code: 400, status_code: "error", message: "User already exists" });
        }

        const newMargdarshak = new Margdarshak({
            ...data
        })
        const savedMargdarshak = await newMargdarshak.save();
        return res.status(200).json({ data: savedMargdarshak, code: 200, status_code: "success", message: "data saved successfully" })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, status_code: "error", message: "something Went Wrong" })
    }
}

const getAllMargdarshaks = async (req, res) => {
    try {
        const allMargdarshaks = await Margdarshak.find();

        return res.status(200).json({ data: allMargdarshaks, code: 200, status_code: "success", message: "Margdarshaks fetched successfully" })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, status_code: "error", message: "something went wrong" })
    }
}


// update margdarshak newly added
// const updateMargdarshakUser = async (req, res) => {
//     const userId = req.body.userId;
//     const updatedData = req.body;
//     try {
//         const updatedMargdarshakUser = await Margdarshak.findByIdAndUpdate(userId, updatedData);

//         if (!updatedMargdarshakUser) {
//             return res.status(404).json({
//                 code: 404,
//                 status_code: "not_found",
//                 message: "Margdarshak not found"
//             });
//         }
//         return res.status(201).json({ code: 201, status_code: "success", message: "Margdarshak Updated Successfully" })
//     }
//     catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             code: 500,
//             status_code: "error",
//             message: "Internal Server Error"
//         });
//     }
// }
const updateMargdarshakUser = async (req, res) => {
    const { userId, amount, date } = req.body;

    try {
        const updatedMargdarshakUser = await Margdarshak.findByIdAndUpdate(
            userId,
            {
                $push: {
                    payments: {
                        amountPaid: amount,
                        datePaid: date || Date.now()
                    }
                }
            },
            { new: true }
        );

        if (!updatedMargdarshakUser) {
            return res.status(404).json({
                code: 404,
                status_code: "not_found",
                message: "Margdarshak not found"
            });
        }

        return res.status(201).json({
            code: 201,
            status_code: "success",
            message: "Margdarshak Updated Successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            status_code: "error",
            message: "Internal Server Error"
        });
    }
};


module.exports = {
    addMargdarshak,
    getAllMargdarshaks,
    updateMargdarshakUser
}