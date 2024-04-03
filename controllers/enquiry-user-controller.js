const EnquiryUser = require('../models/enquiry-user');

// add enquiry user
const addEnquiryUser = async (req, res) => {
    const data = req.body;
    const { mobileNo } = data;

    try {
        //if existing user
        const existingUser = await EnquiryUser.findOne({ mobileNo });
        if (existingUser) {
            return res.status(400).json({ code: 400, status_code: "error", message: "User already exists" });
        }

        // Calculate enquiryNo
        const currentYear = new Date().getFullYear();
        let lastEnquiryUser = await EnquiryUser.findOne().sort({ enquiryNo: -1 });
        let newEnquiryNo;

        if (lastEnquiryUser && !isNaN(lastEnquiryUser.enquiryNo)) {
            const lastEnquiryYear = Math.floor(lastEnquiryUser.enquiryNo / 1000000);
            if (lastEnquiryYear === currentYear % 100) {
                newEnquiryNo = lastEnquiryUser.enquiryNo + 1;
            } else {
                newEnquiryNo = currentYear % 100 * 1000000 + 1; // Start with last two digits of the year
            }
        } else {
            newEnquiryNo = currentYear % 100 * 1000000 + 1; // Start with last two digits of the year
        }

        const newEnquiryUser = new EnquiryUser({
            ...data,
            enquiryNo: newEnquiryNo
        })
        const savedEnquiryUser = await newEnquiryUser.save();
        return res.status(200).json({ data: savedEnquiryUser, code: 200, status_code: "success", message: "Enquiry User added successfully" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, status_code: "error", message: "something Went Wrong" })
    }
}

// Get all enquiry users
const getAllEnquiryUsers = async (req, res) => {
    try {
        const allUsers = await EnquiryUser.find();

        return res.status(200).json({ data: allUsers, code: 200, status_code: "success", message: "All enquiry users fetched successfully" });
    } catch (error) {
        console.error('Error fetching all enquiry users:', error);

        return res.status(500).json({ code: 500, status_code: "error", message: "Something went wrong while fetching enquiry users" });
    }
}

const updateEnquiryUser = async (req, res) => {
    const userId = req.body.userId;
    const updatedData = req.body;
    try {
        const updatedEnquiryUser = await EnquiryUser.findByIdAndUpdate(userId, updatedData);

        if (!updatedEnquiryUser) {
            return res.status(404).json({
                code: 404,
                status_code: "not_found",
                message: "Enquiry not found"
            });
        }
        return res.status(201).json({ code: 201, status_code: "success", message: "Enquiry Updated Successfully" })
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
    addEnquiryUser,
    getAllEnquiryUsers,
    updateEnquiryUser
}