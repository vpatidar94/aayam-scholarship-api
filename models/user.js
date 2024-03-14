const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    token: {
        type: String,
        default: null
    },
    name: {
        type: String,
    },
    mobileNo: {
        type: String,
        required: true,
        unique: true,
        minlength: 10
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
    stream: {
        type: String,
    },
    schoolName: {
        type: String,
    },
    city: {
        type: String,
    },
    testDate: {
        type: String,
    },
    mode: {
        type: String,
    },
    testCenter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Center',
    },
    enrollmentNo: {
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
    type: {
        type: String,
        default: 'user'
    },
})

// Add a pre-save hook to set the password based on dob
userSchema.pre('save', function (next) {
    if (this.dob) {
        // Format dob to ddmmyyyy
        const formattedDob = this.dob.split('-').join('');
        // Set password to formatted dob
        this.password = formattedDob;
    }
    next();
});

// Specify the collection name when creating the model

module.exports = mongoose.model("User", userSchema, "asetusers");