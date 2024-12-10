const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
    code: {
        type: String,
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    date: {
        type: Date,
    },
    fatherName: {
        type: String,
    },
    dob: {
        type: Date,
    },
    mobileNo: {
        type: String,
        required: true,
        unique: true,
        minlength: 10
    },
    alternateMobileNo: {
        type: String,
        required: true,
        unique: true,
        minlength: 10
    },
    email: {
        type: String,
    },
    gender: {
        type: String,
    },
    maritalStatus: {
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
    state: {
        type: String,
    },



    previousOrg: {
        type: String,
    },
    department: {
        type: String,
    },
    designation: {
        type: String,
    },
    workExperience: {
        type: String,
    },
    qualification: {
        type: String,
    },
    degree: {
        type: String,
    },
    yearOfPassing: {
        type: String,
    },

    aayamDepartment: {
        type: String,
    },
    dateOfJoining: {
        type: Date
    },


    photo: {
        type: String,
    },
    pancard: {
        type: String,
    },
    aadharCard: {
        type: String,
    },




    acHolderName: {
        type: String,
    },
    bankName: {
        type: String,
    },
    accountNo: {
        type: String,
    },
    ifscCode: {
        type: String,
    },



    basicSalary: {
        type: Number,
    },
    hra: {
        type: Number,
    },
    ta: {
        type: Number,
    },
    pf: {
        type: Number,
    },
    tds: {
        type: Number,
    },
    totalSalary: {
        type: Number,
        // default: basicSalary + hra + ta + pf + tds
    }

},
    {
        timestamps: true
    }
)

module.exports = mongoose.model("employee", employeeSchema);