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
    medium: {
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
        default: 'PENDING'
    },
    enrollmentNo: {
        type: String,
    },
    remark: {
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
    },
    margdarshak: {
        type: String
    },
    fee: {
        type:String
    },
    visitedStatus: {
        type: String,
        enum: ['VISITED', 'NOT_VISITED'],
        default: 'VISITED'
    },
    leadStatus: {
        type: String,
        enum: ['GENERAL_LEAD', 'HOT_LEAD', 'REJECTED_LEAD'],
        default: ''
    },
},
    {
        timestamps: true,
    })

module.exports = mongoose.model("enquiryUser", enquiryUserSchema, "enquiryUser2425");