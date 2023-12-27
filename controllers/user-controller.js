const { generateToken } = require("../middleware/jwt-token");
const Center = require("../models/test-center");
const User = require("../models/user");
const sendSMS = require("../services/sms-service");
const { generateOTP, saveOTP, verifyOTP } = require("../services/user-otp-service");
const { sendTestInfo } = require("../services/whatsapp-service");

const sendOTPMessage = async (req, res) => {
    const data = req.body;
    const { mobileNo } = data;
    try {
        const otp = await generateOTP();
        await saveOTP(mobileNo, otp);
        const sendSms = await sendSMS(mobileNo, otp);
        res.status(200).json({
            data: sendSms,
            code: 200,
            status_code: 'success',
            message: 'Message sent successfully.',
        });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({
            code: 500,
            status_code: "error",
            message: 'Failed to send message.',
        });
    }
};

const signupOTP = async (req, res) => {
    const data = req.body;
    const { mobileNo, testCenterId, mode } = data;
    console.log("mobileNo", mobileNo)
    try {
        const existingUser = await User.findOne({ mobileNo: mobileNo })
        if (existingUser) {
            return res.status(403).json({ code: 403, status_code: 'error', message: 'user already exist' })
        }
        // Check if the mode is "online" (no need to select a test center)
        if (mode === 'online') {
            await sendOTPMessage(req, res);
            return;
        }

        // Check if there are available seats in any test center
        const centers = await Center.find();
        const availableCenter = centers.find(center => center.capacity > 0);

        if (!availableCenter) {
            // If no seats are available in any center, send a message to contact a specified mobile number
            return res.status(400).json({ code: 400, status_code: 'error', message: 'No seats available in any test center. Contact XXXXXXXXXX for more information.' });
        }
        // Check if the chosen test center has available capacity
        const center = await Center.findOne({ centerId: testCenterId });
        console.log("centerrrrr", center)
        if (center && center.capacity > 0) {
            await sendOTPMessage(req, res);
        } else {
            // If the center is full or not found, prevent user registration and return an error
            return res.status(400).json({ data: center, code: 400, status_code: 'error', message: 'Chosen test center is full or not found' });
        }
    }
    catch (error) {
        return res.status(500).json({ code: 500, status_code: "error" })
    }
}

const signup = async (req, res) => {
    //Existing user check
    const { name, mobileNo, dob, fatherName, fatherMobileNo, stream, schoolName, city, testDate, mode, testCenterId } = req.body;
    try {
        const existingUser = await User.findOne({ mobileNo: mobileNo })
        if (existingUser) {
            return res.status(400).json({ code: 400, status_code: 'error', message: 'user already exist' })
        }

        // Check if the mode is "online" (no need to select a test center)
        if (mode === 'online') {
            const user = await User.create({
                mobileNo: mobileNo,
                name: name,
                dob: dob,
                fatherName: fatherName,
                fatherMobileNo: fatherMobileNo,
                stream: stream,
                schoolName: schoolName,
                city: city,
                testDate: testDate,
                mode: mode,
            });

            await sendTestInfo(mobileNo, mode, testDate);
            return res.status(201).json({ data: { user, isNew: false }, code: 200, status_code: "success", message: "User updated successfully." });
        }

        // Check if there are available seats in any test center
        const centers = await Center.find();
        const availableCenter = centers.find(center => center.capacity > 0);

        if (!availableCenter) {
            // If no seats are available in any center, send a message to contact a specified mobile number
            return res.status(400).json({ code: 400, status_code: 'error', message: 'No seats available in any test center. Contact XXXXXXXXXX for more information.' });
        }

        // Check if the chosen test center has available capacity
        const center = await Center.findOne({ centerId: testCenterId });

        if (center && center.capacity > 0) {
            // //Hashed password
            // const hashedPassword = await bcrypt.hash(password, 10);
            //user create
            const user = await User.create({
                mobileNo: mobileNo,
                name: name,
                dob: dob,
                fatherName: fatherName,
                fatherMobileNo: fatherMobileNo,
                stream: stream,
                schoolName: schoolName,
                city: city,
                testDate: testDate,
                mode: mode,
                testCenter: center._id

            })
            // Update the center's capacity
            center.capacity -= 1;
            await center.save();
            await sendTestInfo(mobileNo, mode, testDate);
            //token generate
            // const token = generateToken(user._id, user.mobileNo);
            return res.status(201).json({ data: { user, isNew: false }, code: 200, status_code: "success", message: "User updated successfully." })
        } else {
            // If the center is full or not found, prevent user registration and return an error
            return res.status(400).json({ code: 400, status_code: 'error', message: 'Chosen test center is full please select other center' });
        }
    } catch (error) {
        console.log("error");
        res.status(500).json({ message: "something went wrong" });
    }

}

const getAllUsers = async (req, res) => {
    try{
        const users = await User.find();
        return res.status(200).json({data: users, code:200, status_code: "success", message: "users fetched successfully"})
    }
    catch (error){
        return res.status(500).json({code:500, status_code:"error"})
    }
}

const signinOTP = async (req, res) => {
    const {mobileNo} = req.body;
    try {
        const existingUser = await User.findOne({ mobileNo: mobileNo })
        if (!existingUser){
            return res.status(404).json({code:404, status_code: "Not Found", message: "user not found"})
        }
        await sendOTPMessage(req, res);
    }
    catch (error){
        return res.status(500).json({code:500, status_code: "error"})
    }
}

const signin = async (req, res) => {
    const {mobileNo} = req.body;

    try{
        if (!mobileNo) {
            return res.status(400).json({ error: 'Mobile number is required' });
          }

        const existingUser = await User.findOne({mobileNo: mobileNo})

        if (!existingUser){
            return res.status(404).json({code:404, status_code: "Not Found", message: "user not found"})
        }

        const token = generateToken(existingUser._id, existingUser.mobileNo, existingUser.type);

        return res.status(200).json({data: {token, user: existingUser}, code:200, status_code:"success", })
    }
    catch (error){
        return res.status(500).json({code:500, status_code:"error", message:"something went wrong"})
    }
}

module.exports = { sendOTPMessage, signupOTP, signup, getAllUsers, signinOTP, signin }