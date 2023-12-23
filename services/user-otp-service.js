const OTP = require("../models/user-otp");

// Generate and return a random OTP (4-digit number)
const generateOTP = () => {
    // Generate a random number between 1000 and 9999
    const otp = Math.floor(1000 + Math.random() * 9000);

    // Convert the number to a string
    const otpString = otp.toString();

    // Ensure the string has exactly 4 digits by padding with zeros if needed
    const fourDigitOtp = otpString.padStart(4, '0');

    return Number(fourDigitOtp);
};

const saveOTP = async (mobileNo, otp) => {
    try {
        const removeOtpRecord = await OTP.findOneAndDelete({ mobileNo: mobileNo });

        const otpRecord = new OTP({
            mobileNo: mobileNo,
            otp: otp
        })
        await otpRecord.save();
    }
    catch (error) {
        console.error('Error saving OTP:', error);
        throw error;
    }
}

const getSavedOTP = async (req, res) => {
    const { mobileNo } = req.body
    try {
        const otpRecord = await OTP.findOne({ mobileNo: mobileNo });
        const savedOtp = otpRecord ? otpRecord.otp : null;
        return res.status(200).json({ data: savedOtp, code: 200, status_code: 'success' });
    }
    catch (error) {
        return res.status(404).json({ code: 404, status_code: "Not Found", })
    }
}

const verifyOTP = async (req, res) => {
    const { mobileNo, enteredOtp } = req.body;
    try {
        const otpRecord = await OTP.findOne({ mobileNo: mobileNo });
        const storedOtp = otpRecord ? otpRecord.otp : null;
        isVerified = storedOtp === enteredOtp;
        if (isVerified) {
            return res.status(200).json({ data: isVerified, code: 200, status_code: "success" });
        } else {
            return res.status(400).json({ code: 400, status_code: "error", message: "Invalid OTP. Verification failed." });
        }
    }
    catch (error) {
        console.error('Error verifying OTP', error);
        return res.status(500).json({ code: 500, status_code: "error", message: "OTP verification failed" })
    }
}


module.exports = { generateOTP, saveOTP, getSavedOTP, verifyOTP };