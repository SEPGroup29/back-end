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
        type: 'Date',
        required: true,
        default: Date.now,
        expires: 60
    }
})

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });      // OTP entry will delete in 1 minute

const OTP = mongoose.model('OTP', otpSchema);
module.exports = OTP;