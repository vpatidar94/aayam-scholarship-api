const CallLogs = require('../models/call-logs');

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
module.exports = {
    addCallLog
}