const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leadAssignmentHistorySchema = new Schema({
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
    telecallerId: { type: Schema.Types.ObjectId, ref: 'Telecaller', required: true },
    assignedDate: { type: Date, default: Date.now }, // When assigned
    reassigned: { type: Boolean, default: false }, // Is this a reassignment?
    assignedBy: { type: Schema.Types.ObjectId, ref: 'Admin' } // Admin who assigned
});

module.exports = mongoose.model('LeadAssignmentHistory', leadAssignmentHistorySchema);
