const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const margdarshakSchema = new Schema({
    code: {
        type: String,
    },
    name: {
        type: String,
    },
    // maritalStatus: {
    //     type: String,
    // },
    dob: {
        type: Date,
    },
    // doa: {
    //     type: Date                                mobileNo, name, dob, gender, address, city, district, email, occupation, orgName, margdarshakCategory
    // },
    // registrationNo: {
    //     type: String,
    // },
    // age: {
    //     type: String
    // },
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
    city: {
        type: String,
    },
    district: {
        type: String,
    },
    occupation: {
        type: String,
    },
    orgName: {
        type: String,
    },
    margdarshakCategory: {
        type: String,
    },
    accountNo: {
        type: String,
    },
    ifscCode: {
        type: String,
    },
    associatedBy: {
        type: String,
    },

    // qualification: {
    //     type: String,
    // },
    // speciality: {
    //     type: String,
    // },
    // fellowship: {
    //     type: String
    // },
    // jobPattern: {
    //     type: String,
    // },
    // achievements: {
    //     type: String,
    // },
    // awards: {
    //     type: String,
    // },
    // dreams: {
    //     type: String,
    // }
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model("margdarshak", margdarshakSchema);