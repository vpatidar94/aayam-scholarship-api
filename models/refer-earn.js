const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const referEarnSchema = new Schema({
    
    studentRollNo: {
        type: String,
    },
    studentName: {
        type: String,
        // required: true
    },
    
    studentMobileNo: {
        type: String,
    },
    
    
},
    {
        timestamps: true
    })

module.exports = mongoose.model("refer-earn", referEarnSchema);