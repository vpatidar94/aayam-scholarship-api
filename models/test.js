const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const test = new Schema({
    id: {
        type: String,
        unique: true,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    subTitle: {
        type: String,
    },
    subjectNames: {
        type: Array,
        required: true,
    },
    stream: {
        type: Array,
        required: true,
    },
    active: {
        type: Boolean,
        default: true
    },
    questions: {
        type: Array,
        default: []
    },
    passingScore: {
        type: Number,
    },
    testDate: {
        type: Date,
    },
    testDuration: {
        type: Number,
        default: 0,
        required: true,
    },
    resultDate: {
        type: Date,
    },
    isRankGenerated: {
        type: Boolean,
        default: false,
    }
})

module.exports = mongoose.model("Test", test);