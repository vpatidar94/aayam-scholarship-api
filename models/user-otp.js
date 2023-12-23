const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const otpSchema = new Schema({
    mobileNo: {
        type: String,
        required: true,
        minlength: 10
    },
    otp:{
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },

})
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 120 });

module.exports = mongoose.model('OTP', otpSchema)