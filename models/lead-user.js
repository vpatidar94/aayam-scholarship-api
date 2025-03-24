const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leadSchema = new Schema({
    fullName: {
        type: String,
    },
    mobileNo: {
        type: String,
        required: true,
        unique: true,
        minlength: 10
    },
    parentName: {
        type: String,
    },
    parentMobileNo: {
        type: String,
    },
    schoolName: {
        type: String,
    },
    city: {
        type: String,
    },
    district: {
        type: String,
    },
    email: {
        type: String,
    },
    gender: {
        type: String,
    },
    class: {
        type: String,
    },
    stream: {
        type: String,
    },
    medium: {
        type: String,
    },
    leadSource: {
        type: String,
        // enum: ['organic', 'paid', 'referral'],
        // default: 'organic'
    },
    status: {
        type: String,
        enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'NOT_INTERESTED'],
        default: 'NEW'
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'Telecaller',
        default: null
    },
    callResponses: [{ type: Schema.Types.ObjectId, ref: 'CallResponse' }],
    lastAssignedDate: {
        type: Date
    },             // Date of last assignment
    lastContactedDate: {
        type: Date
    },
    followUpDate: {
        type: Date
    },
    // Status Tracking
    contacted: {
        type: Boolean,
        default: false                // True if contacted at least once
    },
    pending: {
        type: Boolean,
        default: true                 // True if pending for current assignment
    },
    convertedBy: {
        type: String,
    },
    convertedDate: {
        type: Date,
    }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);