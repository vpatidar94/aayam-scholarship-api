const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const doctorSchema = new Schema({
    name: {
        type: String,
    },
    maritalStatus: {
        type: String,
    },
    dob: {
        type: Date,
    },
    doa: {
        type: Date
    },
    registrationNo: {
        type: String,
    },
    age: {
        type: String
    },
    gender: {
        type: String,
    },
    mobileNo: {
        type: String,
        required: true,
        unique: true,
        minlength: 10
    },
    email: {
        type: String,
    },
    address: {
        type: String,
    },
    qualification: {
        type: String,
    },
    speciality: {
        type: String,
    },
    fellowship: {
        type: String
    },
    jobPattern: {
        type: String,
    },
    achievements: {
        type: String,
    },
    awards: {
        type: String,
    },
    dreams: {
        type: String,
    }
},
    {
        timestamps: true
    })

module.exports = mongoose.model("doctor", doctorSchema);