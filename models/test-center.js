const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const centerSchema = new Schema({
    centerName: {
        type: String,
        required: true,
    },
    capacity: {
        type: Number,
        required: true,
        min: 0, // Minimum capacity allowed
    },
    centerId: {
        type: String,
        required: true
    },
    address: {
        type:String
    },
    enrollId: {
        type: String
    },
    sessionCode: {
        type: String
    }
});

const Center = mongoose.model("testCenter", centerSchema);

module.exports = Center;