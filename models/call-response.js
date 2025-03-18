const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const callResponseSchema = new Schema({
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true }, // Reference
    telecallerId: { type: Schema.Types.ObjectId, ref: 'Telecaller', required: true }, // Reference
    callDate: { type: Date, default: Date.now },
    callType: { type: String, enum: ['INITIAL', 'FOLLOW_UP', 'CLOSING'] },
    callOutcome: { type: String, enum: ['SUCCESSFUL', 'UNSUCCESSFUL', 'PENDING'] },
    callDuration: { type: Number }, // in seconds
    response: {
        type: String, 
        enum: ['POSITIVE', 'NEGATIVE', 'NEUTRAL', 'NOT_ANSWERED'],
        default: 'NEUTRAL'
    },
    notes: { type: String },
    nextFollowUpDate: { type: Date },
    leadStatusUpdated: { type: Boolean, default: false },
});

module.exports = mongoose.model('CallResponse', callResponseSchema);