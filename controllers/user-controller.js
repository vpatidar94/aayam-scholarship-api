const { generateToken } = require("../middleware/jwt-token");
const Center = require("../models/test-center");
const User = require("../models/user");
const sendSMS = require("../services/sms-service");
const { generateOTP, saveOTP, verifyOTP } = require("../services/user-otp-service");
const { sendTestInfo, sendRank } = require("../services/whatsapp-service");
const TestCenter = require("../models/test-center");
const result = require("../models/result");

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
    //console.log("mobileNo", mobileNo)
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
        //console.log("centerrrrr", center)
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
    try {
        const users = await User.find();
        return res.status(200).json({ data: users, code: 200, status_code: "success", message: "users fetched successfully" })
    }
    catch (error) {
        return res.status(500).json({ code: 500, status_code: "error" })
    }
}

const signinOTP = async (req, res) => {
    const { mobileNo } = req.body;
    try {
        const existingUser = await User.findOne({ mobileNo: mobileNo })
        if (!existingUser) {
            return res.status(404).json({ code: 404, status_code: "Not Found", message: "user not found" })
        }
        await sendOTPMessage(req, res);
    }
    catch (error) {
        return res.status(500).json({ code: 500, status_code: "error" })
    }
}

const signin = async (req, res) => {
    const { mobileNo } = req.body;

    try {
        if (!mobileNo) {
            return res.status(400).json({ error: 'Mobile number is required' });
        }

        const existingUser = await User.findOne({ mobileNo: mobileNo })

        if (!existingUser) {
            return res.status(404).json({ code: 404, status_code: "Not Found", message: "user not found" })
        }

        const token = generateToken(existingUser._id, existingUser.mobileNo, existingUser.type, existingUser.mode);

        return res.status(200).json({ data: { token, user: existingUser }, code: 200, status_code: "success", })
    }
    catch (error) {
        return res.status(500).json({ code: 500, status_code: "error", message: "something went wrong" })
    }
}

const getUserById = async (req, res) => {
    const { userId } = req.user;
    try {
        if (!userId) {
            return res.status(400).json({ code: 404, status_code: "error", message: "userId required" })
        }
        const user = await User.findById(userId).lean();
        let userData = { ...user };
        // Fetch TestCenter details
        if (user.mode === 'offline') {
            const testCenter = await TestCenter.findById(user.testCenter).lean();

            userData = {
                ...userData,
                testCenter: testCenter
                    ? testCenter
                    : null,
            };
        }

        return res.status(200).json({ data: userData, code: 200, status_code: "success", message: "User Fetched Successfully", })
    } catch {
        return res.status(500).json({ code: 500, status_code: "error", message: "an error occured while fetching user" })
    }
}

//generate enrollmentNo
const generateAllEnrollmentNo = async (req, res) => {
    try {
        const users = await User.find();
        const enrollmentNumbers = [];

        for (const user of users) {
            const result = await generateEnrollmentNo(user);
            // Check if result is defined and has the expected properties
            if (result && result.data && result.data.enrollmentNo) {
                enrollmentNumbers.push({ userId: user._id, enrollmentNo: result.data.enrollmentNo });
            } else {
                if (result.code === 500) {
                    console.error(`Error generating enrollmentNo for user ${user._id, user.name}: Invalid result structure`);
                }
            }
        }

        res.status(200).json({ data: enrollmentNumbers, code: 200, status_code: "success", message: "Enrollment numbers generated successfully for all users." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, status_code: "error", error: 'An error occurred while generating enrollment numbers for users.' });
    }
}

const generateSingleEnrollmentNo = async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const userEnl = await generateEnrollmentNo(user);
        res.status(200).json({ data: userEnl, success: true, message: 'Enrollment number generated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error generating enrollment number.' });
    }
}
const generateEnrollmentNo = async (user) => {
    try {
        // Check if enrollmentNo already exists
        if (user.enrollmentNo) {
            return { code: 400, status_code: 'error', error: 'EnrollmentNo already generated' };
        }

        // Generate consistent enrollmentNo based on mode and enrollId
        let enrollmentNo;

        if (user.mode === 'offline') {
            // Fetch TestCenter details
            const testCenter = await TestCenter.findById(user.testCenter);
            if (!testCenter) {
                return { code: 404, status_code: 'error', error: 'TestCenter not found' };
            }

            // If mode is offline, use the first two digits from testCenter's enrollId
            const firstTwoDigits = testCenter.enrollId.toString().padStart(2, '0');
            const sequentialNumber = await getSequentialNumber(user.testCenter, user.mode);
            //enrollmentNo = `${firstTwoDigits}${sequentialNumber.toString().padStart(4, '0')}`;
            enrollmentNo = `${firstTwoDigits}${sequentialNumber}`;
        } else if (user.mode === 'online') {
            // If mode is online, start enrollmentNo with 99
            const sequentialNumber = await getSequentialNumber(user.testCenter, user.mode);
            enrollmentNo = `9${sequentialNumber.toString().padStart(5, '0')}`;
        } else {
            return { code: 400, status_code: 'error', error: 'Invalid user mode' };
        }

        //console.log(enrollmentNo);
        // Save enrollmentNo to the user
        user.enrollmentNo = enrollmentNo;
        await user.save();

        return { code: 200, status_code: 'success', data: { enrollmentNo }, message: 'EnrollmentNo generated successfully' };
    } catch (error) {
        console.error(error);
        return { code: 500, status_code: 'error', error: 'An error occurred while generating enrollmentNo' };
    }
};

async function getSequentialNumber(testCenterId, mode) {
    try {
        // Check if enrollmentNo field exists in the documents
        const enrollmentNoExists = await User.exists({ testCenter: testCenterId, mode: mode, enrollmentNo: { $exists: true } });

        let userCount;
        let sequentialNumber;

        if (enrollmentNoExists) {
            // If enrollmentNo exists, count documents with enrollmentNo
            userCount = await User.countDocuments({
                testCenter: testCenterId,
                mode: mode,
                enrollmentNo: { $exists: true },
            });
        } else {
            // If enrollmentNo does not exist, start the count from 1
            userCount = 0;
        }
        if (mode === 'offline') {
            // Increment the count and pad with leading zeros
            sequentialNumber = (userCount + 1).toString().padStart(4, '0');
        } else if (mode === 'online') {
            // Increment the count and pad with leading zeros
            sequentialNumber = (userCount + 1).toString().padStart(5, '0');
        }
        // console.log("seqNo", sequentialNumber)
        return sequentialNumber;
    }
    catch (error) {
        console.error(error);
        // Handle the error, possibly return a default value or throw an exception
        return null;
    }
}

const findUserByMobileNo = async (req, res) => {
    try {
        const { mobileNo } = req.body;

        if (!mobileNo) {
            return res.status(400).json({ code: 400, status_code: "error", message: "Mobile number is required" });
        }

        const user = await User.findOne({ mobileNo })

        if (!user) {
            return res.status(404).json({ code: 404, status_code: "error", message: "User not found" });
        }

        return res.status(200).json({ data: user, code: 200, status_code: "success", message: "User found successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, status_code: "error", message: "An error occurred while finding the user" });
    }
};

const getAllUsersByStream = async (req, res) => {
    const { stream } = req.params;
    try {
        const users = await User.find({ stream: stream })
            .select('-result.studentResponse')
            .sort({ 'result.score': -1 });

        return res.status(200).json({ data: users, code: 200, status_code: "success", });
    }
    catch (error) {
        return res.status(500).json()({ code: 500, status_code: "error", message: "error in finding users" })
    }
}

const getAllUsersByClass = async (req, res) => {
    const { selectedStream } = req.body;

    try {
        let users;

        const streamMappings = {
            '11': ['11-PCB', '11-PCM'],
            '12': ['12-PCB', '12-PCM'],
        };

        const streamsToFetch = streamMappings[selectedStream] || [selectedStream];

        users = await User.find({
            stream: { $in: streamsToFetch },
        
        }).select('-result.studentResponse').sort({  'result.normalizedScore': -1,'result.rank': 1,'result.score': -1,  });

        return res.status(200).json({ data: users, code: 200, status_code: "success" });
    } catch (error) {
        return res.status(500).json({ code: 500, status_code: "error", message: "error in finding users" });
    }
};


const updateOfflineResults = async (req, res) => {
    const { offlineResults } = req.body;
    try {
        const updatedUsers = await Promise.all(offlineResults.map(async (result) => {
            const user = await User.findOne({ enrollmentNo: result.studentRollNo.toString() });

            if (!user) {
                return res.status(404).json({ code: 404, status_code: `"user not found ${result.studentRollNo.toString()}"` });
            }
            const formattedUserData = {
                userId: user._id,
                name: result.studentName,
                rollNo: result.studentRollNo,
                score: result.score,
                correctCount: result.correctCount,
                incorrectCount: result.incorrectCount,
                unattemptedCount: result.unattemptedCount,
                rank: null,
                duration: 7200,  // Replace with the actual duration
                //---------------for 9/10 students-----------
                // subjectCounts: {
                //     "SCIENCE": {
                //         correct: result.scienceR,
                //         incorrect: result.scienceW,
                //         unattempted: result.scienceU,
                //     },
                //     "SOCIAL-SCIENCE": {
                //         correct: result.socialScienceR,
                //         incorrect: result.socialScienceW,
                //         unattempted: result.socialScienceU,
                //     },
                //     "MATHS": {
                //         correct: result.mathsR,
                //         incorrect: result.mathsW,
                //         unattempted: result.mathsU,
                //     },
                // },

                //---- for 11/12 PCM students------
                // subjectCounts: {
                //     "PHYSICS": {
                //         correct: result.physicsR,
                //         incorrect: result.physicsW,
                //         unattempted: result.physicsU,
                //     },
                //     "CHEMISTRY": {
                //         correct: result.chemistryR,
                //         incorrect: result.chemistryW,
                //         unattempted: result.chemistryU,
                //     },
                //     "MATHS": {
                //         correct: result.mathsR,
                //         incorrect: result.mathsW,
                //         unattempted: result.mathsU,
                //     },
                // },

                //------- for 11/12 PCB students-----
                subjectCounts: {
                    "PHYSICS": {
                        correct: result.physicsR,
                        incorrect: result.physicsW,
                        unattempted: result.physicsU,
                    },
                    "CHEMISTRY": {
                        correct: result.chemistryR,
                        incorrect: result.chemistryW,
                        unattempted: result.chemistryU,
                    },
                    "BIOLOGY": {
                        correct: result.biologyR,
                        incorrect: result.biologyW,
                        unattempted: result.biologyU,
                    },
                },
            };

            user.result.push(formattedUserData);
            await user.save();

            // Return the updated user data
            return user;
        }));

        return res.status(200).json({ code: 200, status_code: "success", message: "offline results updated successfully", data: updatedUsers });
    }
    catch (error) {
        return res.status(500).json({ code: 500, status_code: "error" });
    }
}

const generateRankByStream = async (req, res) => {
    const { stream } = req.body;
    try {
        const sortedScores = await User.find({ stream, 'result.0': { $exists: true } })
            .select('-result.studentResponse')
            .select('-result.subjectCounts')
            .sort({ 'result.0.score': -1 });

        // Iterate over sorted scores and update the rank in each user's result array
        await Promise.all(sortedScores.map(async (user, index) => {
            user.result[0].rank = index + 1;
            // await user.save();
        }));

        return res.status(200).json({ data: sortedScores, code: 200, status_code: "success" })
    }
    catch (error) {
        return res.status(500).json({ code: 500, status_code: "something went wrong" })
    }
}

const generateRankByClass = async (req, res) => {
    const { selectedStream } = req.body;
    try {
        const streamMappings = {
            '11': ['11-PCB', '11-PCM'],
            '12': ['12-PCB', '12-PCM'],
        };

        const streamsToFetch = streamMappings[selectedStream] || [selectedStream];

        const users = await User.find({
            stream: { $in: streamsToFetch },
            'result.0': { $exists: true }
        })
            .select('-result.studentResponse')
            .select('-result.subjectCounts')
            .sort({ 'result.0.normalizedScore': -1 });

        // Generate rank based on the sorted user objects
        await Promise.all(users.map(async (user, index) => {
            user.result[0].rank = index + 1;
             // Mark 'result' array as modified
             user.markModified('result');
            // Save the updated rank to the database
            await user.save();
        }));

        return res.status(200).json({ data: users, code: 200, status_code: "success", message: "result generated successfully" })
    }
    catch (error) {
        return res.status(500).json({ code: 500, status_code: "something went wrong" })
    }
}

const calculateNormalizedScores = async (req, res) => {
    const { selectedStream } = req.body;

    try {
        const streamMappings = {
            '11': ['11-PCB', '11-PCM'],
            '12': ['12-PCB', '12-PCM'],
        };

        const streamsToFetch = streamMappings[selectedStream] || [selectedStream];

        const users = await User.find({
            stream: { $in: streamsToFetch },
            'result.0': { $exists: true }
        })
            .select('-result.studentResponse')
            .select('-result.subjectCounts');

        // Iterate over users and update the normalized score in each user's result array
        await Promise.all(users.map(async (user) => {
            const rawScore = user.result[0].score || 0; // Retrieve 'rawScore' from the user's result
            const mode = user.mode;
            const normalizationFactor = mode === 'offline' ? 1.1 : 0.9;

            // Directly set normalizedScore in user.result[0]
            user.result[0].normalizedScore = Math.min((rawScore * normalizationFactor).toFixed(2), 235);
            // Mark 'result' array as modified
            user.markModified('result');
            // Save the updated user object to the database
            await user.save();
        }));

        return res.status(200).json({ data: users, code: 200, status_code: "success", message: "Normalized scores calculated and saved successfully" });
    } catch (error) {
        return res.status(500).json({ code: 500, status_code: "something went wrong" });
    }
};


const sendWpMessageByClass = async (req, res) => {
    const data = req.body;
    const { stream } = data;
    try {
        const streamMappings = {
            '11': ['11-PCB', '11-PCM'],
            '12': ['12-PCB', '12-PCM'],
        };

        const streamsToFetch = streamMappings[stream] || [stream];
        const userResults = await User.find({
            stream: { $in: streamsToFetch },
            'result.0': { $exists: true }
        })
        // Get the score of last test given
        for (const std of userResults) {
            try {
                const user = await User.find({ _id: std._id });
                const title = 'jeet scholarship test'
                const totalPoints = 1000;
                const totalStudents = 5500
                if (user.length > 0 && !!user[0]?.mobileNo)
                    await sendRank(user[0], std, totalStudents, title, totalPoints);
                //await sendRank(user[0], std, totalStudents, title, totalPoints);
            } catch (error) {
                console.error('Error sending WhatsApp message:', error);
            }
        }

        res.status(200).json({
            data: userResults,
            code: 200,
            status_code: 'success',
            message: 'Whatsapp messages send successfully.',
        });

    } catch (error) {
        res.status(500).json({ code: 500, status_code: "error", error: 'Wrong test id.' });
    }
}

module.exports = {
    sendOTPMessage, signupOTP, signup, getAllUsers, signinOTP, signin, getUserById,
    generateSingleEnrollmentNo, generateAllEnrollmentNo, findUserByMobileNo, getAllUsersByStream,
    updateOfflineResults, generateRankByStream, getAllUsersByClass, generateRankByClass,
    sendWpMessageByClass, calculateNormalizedScores
};

