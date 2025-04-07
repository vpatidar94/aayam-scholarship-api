const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const callLogsSchema = new Schema({
    
    msgDate: {
        type: String,
    },
    msgTime: {
        type: String,
        // required: true
    },
    
    msgText: {
        type: String,
    },
    msgCustom01: {
        type: String
    },
    
},
    {
        timestamps: true
    })

module.exports = mongoose.model("callLogs", callLogsSchema);