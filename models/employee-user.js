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
    pin_code: {
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
    work_experience: {
        type: String,
    },
    qualification: {
        type: String,
    },
    degree: {
        type: String,
    },
    yoPassing: {
        type: String,
    },




    photo:  {
        type: String,
    },
    pancard:  {
        type: String,
    },
    aadhar_card:  {
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


    
    basicSalary:{
        type: String,
    },
    hra: {
        type: String,
    },
    ta: {
        type: String,
    },
    pf: {
        type: String,
    },
    tds:{
        type: String,
    },

},
    {
        timestamps: true
    }
)

module.exports = mongoose.model("employee", employeeSchema);