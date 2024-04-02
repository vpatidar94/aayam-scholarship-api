const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const enquiryUserSchema = new Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String
    },
    mobileNo: {
        type: String,
        required: true,
        unique: true,
        minlength: 10
    },
    gender: {
        type: String,
    },
    stream: {
        type: String,
    },
    prevClass: {
        type: String,
    },
    howDoYouCometoKnow: {
        type: String
    },
    mode: {
        type: String,
    },
    enquiryNo: {
        type: Number,
        unique: true
    },
    howDoYouComeToKnow: {
        type: String,
    },
    counsellor: {
        type: String,
        default: null
    },
    attender: {
        type: String,
        default: null
    },
    admissionStatus: {
        type: String,
        enum: ['DONE', 'PENDING', 'NOT_INTERESTED', 'INTERESTED'],
    },
    enrollmentNo: {
        type: String,
    },
    dob: {
        type: String
    },
    password: {
        type: String,
    },
    fatherName: {
        type: String,
    },
    fatherMobileNo: {
        type: String,
        minlength: 10
    },
    schoolName: {
        type: String,
    },
    city: {
        type: String,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    result: {
        type: Array,
        default: []
    }
},
    {
        timestamps: true,
    })

module.exports = mongoose.model("enquiryUser", enquiryUserSchema);