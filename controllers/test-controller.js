const Result = require("../models/result");
const Test = require("../models/test");
// const router = require("../routes/result-routes");

const addTest = async (req, res) => {
  try {
    const data = req.body;
    if (!data.id || !data.title) {
      return res.status(400).json({ code: 400, status_code: "error", error: 'Test details are required.' });
    }

    try {
      const newTest = new Test({
        ...data
      })
      await newTest.save();

      return res.status(201).json({ data: newTest, code: 200, status_code: "success", message: "Test added successfully." })
    } catch (error) {
      res.status(500).json({ code: 500, status_code: "error", error: 'Enter in adding test' });
    }
  } catch (error) {
    res.status(500).json({ code: 500, status_code: "error", error: 'An error occurred while adding the test' });
  }
}

const getTest = async (req, res) => {
  try {
    const { testId } = req.params;
    if (!testId) {
      return res.status(400).json({ code: 400, status_code: "error", error: 'Test id required' });
    }
    const test = await Test.find({ id: testId });
    if (!test || test.length <= 0) {
      return res.status(404).json({ code: 404, status_code: "error", error: 'Test not found' });
    }
    else {
      const testIdCheck = test[0]._id.toString()
      const isTestAttempted = await Result.findOne({ testId: testIdCheck, userId: req.user.userId });
      if (isTestAttempted) {
        return res.status(452).json({ code: 452, status_code: "error", error: 'Test Already Attempted' });
      }
    }
    return res.status(200).json({ data: test[0], code: 200, status_code: "success", message: "Test fetched successfully." })
  } catch (error) {
    res.status(500).json({ code: 500, status_code: "error", error: 'An error occurred while fetching the test details' });
  }
}

const deleteTest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ code: 400, status_code: "error", error: 'Test id required' });
    }
    const test = await Test.findByIdAndDelete(id)
    if (!test) {
      return res.status(500).json({ message: "unable to delete test" });
    }
    return res.status(200).json({ data: test, code: 200, status_code: "success", message: " Test deleted successfully" })
  }
  catch (error) {
    res.status(500).json({ code: 500, status_code: "error", error: 'An error occurred while fetching the test details' });
  }
}
const getAllTest = async (req, res) => {
  const userType = req.user.type;
  try {
    const { stream } = req.query;
    let query = {};

    // Add stream filter to the query if provided
    if (stream) {
      query = { stream: stream };
    }
    // For org-admin, filter tests up to the current date
    if (userType === 'org-admin') {
      query.testDate = { $lte: new Date() };
    }
    const tests = await Test.find(query).sort({ testDate: -1 });

    if (!tests || tests.length <= 0) {
      return res.status(200).json({ code: 201, data: [], status_code: "success", message: 'No test found.' });
    }

    return res.status(200).json({ data: tests, code: 200, status_code: "success", message: "All Tests records fetched successfully." })

  } catch (error) {
    return res.status(500).json({ code: 500, status_code: "error", error: 'An error occurred while fetching the test details' });
  }
}

const getTestDetail = async (req, res) => {
  try {
    const { testId } = req.params;
    if (!testId) {
      return res.status(400).json({ code: 400, status_code: "error", error: 'Test id required' });
    }

    const test = await Test.find({ _id: testId });

    if (!test || test.length <= 0) {
      return res.status(404).json({ code: 404, status_code: "error", error: 'Test not found' });
    }

    return res.status(200).json({ data: test[0], code: 200, status_code: "success", message: "Test fetched successfully." })

  } catch (error) {
    res.status(500).json({ code: 500, status_code: "error", error: 'An error occurred while fetching the test details' });
  }
}

const submitResult = async (req, res) => {
  try {
    const data = req.body;
    if (!data.testId || !data.questions || !data.questions.length < 0) {
      return res.status(400).json({ code: 400, status_code: "error", error: 'Test details are required.' });
    }
    const reqQuestions = data.questions;
    try {
      const test = await Test.findOne(
        { id: data.testId }
      );
      let scoreCount = 0;
      if (test) {
        test.questions.forEach(element => {
          const index = reqQuestions.some(x => x.id === element.id && x?.studentAnswer === element?.correctAnswer);
          if (index) {
            scoreCount++;
          }
        });

        try {
          const resResult = {
            userId: req.user.userId,
            testId: test._id,
            score: scoreCount,
            rank: null,
            duration: data.duration ?? 0,
            studentResponse: reqQuestions
          }
          const newResult = new Result(resResult)
          await newResult.save();

          return res.status(200).json({ data: { ...resResult }, code: 200, status_code: "success", message: "Score added successfully." })
        } catch (error) {
          res.status(500).json({ code: 500, status_code: "error", error: 'Enter correct mobile number' });
        }

      }
      else {
        res.status(500).json({ code: 500, status_code: "error", error: 'Test not found.' });
      }

    } catch (error) {
      res.status(500).json({ code: 500, status_code: "error", error: 'Test not found' });
    }
  } catch (error) {
    res.status(500).json({ code: 500, status_code: "error", error: 'An error occurred while adding the test' });
  }
}

const getTestByStream = async (req, res) => {
  try {
    const { stream } = req.params;

    if (!stream) {
      return res.status(400).json({ code: 400, status_code: "error", error: 'stream required' });
    }

    const test = await Test.findOne({ stream }); // Assuming you expect only one test

    if (!test) {
      return res.status(404).json({ code: 404, status_code: "error", error: 'Test not found' });
    }

    // Assuming questions are stored in an array in the 'questions' field
    const allQuestions = test.questions;

    // Divide questions into three groups
    const group1 = allQuestions.slice(0, 100);
    const group2 = allQuestions.slice(100, 200);
    const group3 = allQuestions.slice(200, 300);

    // Randomly select 20 questions from each group
    const selectedQuestions = [
      ...getRandomSubset(group1, 20),
      ...getRandomSubset(group2, 20),
      ...getRandomSubset(group3, 20),
    ];
    
    // Remove 'correctAnswer' field from each question
    const testQuestions = selectedQuestions.map(({ correctAnswer, ...rest }) => rest);

    return res.status(200).json({ data: testQuestions, code: 200, status_code: "success", message: "Test questions fetched successfully." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, status_code: "error", error: 'An error occurred while fetching the test details' });
  }
}

// Helper function to get a random subset of an array
function getRandomSubset(array, count) {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}


exports.addTest = addTest;
exports.getTest = getTest;
exports.getTestDetail = getTestDetail;
exports.getAllTest = getAllTest;
exports.submitResult = submitResult;
exports.deleteTest = deleteTest;
exports.getTestByStream = getTestByStream;