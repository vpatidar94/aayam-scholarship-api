const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sakshamSchoolSchema = new Schema({
    schoolCode: {
        type: String,
    },
    schoolName: {
        type: String,
    },
    board: {
        type: Date,
    },
    medium: {
        type: String,
    },
   
    email: {
        type: String,
    },
    address: {
        type: String,
    },
    city: {
        type: String,
    },
    district: {
        type: String,
    },
    pinCode: {
        type: String,
    },
    tenthStrength: {
        type: String,
    },
    tenthFee: {
        type: String,
    },
    twelthStrength: {
        type: String,
    },
    twelthFee: {
        type: String,
    },
    associatedBy: {
        type: String,
    },
    authorizedPersonName: {
        type: String,
    },
    mobileNo: {
        type: String,
        required: true,
        unique: true,
        minlength: 10
    },
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model("sakshamSchool", sakshamSchoolSchema);