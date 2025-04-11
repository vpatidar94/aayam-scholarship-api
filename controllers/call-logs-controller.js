const CallLogs = require('../models/call-logs');

//single add
const addCallLog = async (req, res) => {
    try {
        const { msgDate, msgTime, msgText, msgCustom01 } = req.body;

        const callLog = new CallLogs({
            msgDate,
            msgTime,
            msgText,
            msgCustom01
        });

        const saved = await callLog.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ error: 'Error saving message', details: error.message });
    }
}

//multiple add
const addMultipleCallLog = async (req, res) => {
    try {
        const messages = req.body; // Expecting array of objects
        if (!Array.isArray(messages)) {
            return res.status(400).json({ error: 'Input should be an array' });
        }

        let added = [];
        let skipped = [];

        for (const msg of messages) {
            const exists = await CallLogs.findOne({
                msgDate: msg.msgDate,
                msgTime: msg.msgTime,
                msgText: msg.msgText,
                msgCustom01: msg.msgCustom01
            });

            if (!exists) {
                const newLog = new CallLogs(msg);
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
const getAllCallLogs = async (req, res) => {
    try {
        const allCallLogs = await CallLogs.find();

        return res.status(200).json({ data: allCallLogs, code: 200, status_code: "success", message: "CallLogs fetched successfully" })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, status_code: "error", message: "something went wrong" })
    }
}

module.exports = {
    addCallLog,
    addMultipleCallLog,
    getAllCallLogs
}