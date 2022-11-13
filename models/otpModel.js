const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const otpSchema = new Schema({
    email: {
        type: 'String',
        required: true
    },
    otp: {
        type: 'String',
        required: true
    },
    createdAt: {
        type: Date,
        expires: '10m',  // OTP entriees will delete in 10 minutes
        default: Date.now
    }
})

// otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });      // OTP entry will delete in 1 minute

const OTP = mongoose.model('OTP', otpSchema);
module.exports = OTP;