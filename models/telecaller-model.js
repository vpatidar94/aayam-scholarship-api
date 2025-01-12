const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const telecallerSchema = new Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, unique: true },
    dailyQuota: { type: Number, default: 50 },
    callsMadeToday: { type: Number, default: 0 },
    totalCallsMade: { type: Number, default: 0 },
    leadsConverted: { type: Number, default: 0 },
    incentiveEarned: { type: Number, default: 0 },
    absent: { type: Boolean, default: false }
});

module.exports = mongoose.model('Telecaller', telecallerSchema);