
const Students = require('../models/refer-earn');
//multiple add
const addMultipleStudents = async (req, res) => {
    try {
        const messages = req.body; // Expecting array of objects
        if (!Array.isArray(messages)) {
            return res.status(400).json({ error: 'Input should be an array' });
        }

        let added = [];
        let skipped = [];

        for (const msg of messages) {
            const exists = await Students.findOne({
                studentRollNo: msg.studentRollNo,
                studentName: msg.studentsName,
                studentMobileNo: msg.studentMobileNo,
            });

            if (!exists) {
                const newLog = new Students(msg);
                await newLog.save();
                added.push(msg);
            } else {
                skipped.push(msg);
            }
        }

        res.status(200).json({
            message: 'success',
            addedCount: added.length,
            skippedCount: skipped.length,
            added,
            skipped
        });
    } catch (error) {
        res.status(500).json({ error: 'Error saving message', details: error.message });
    }
}

const getAllStudents = async (req, res) => {
    try {
        const allStudents = await Students.find();

        return res.status(200).json({ data: allStudents, code: 200, status_code: "success", message: "Students fetched successfully" })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, status_code: "error", message: "something went wrong" })
    }
}
module.exports = {
    addMultipleStudents,
    getAllStudents,
}