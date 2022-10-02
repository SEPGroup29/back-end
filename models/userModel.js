const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    loginType: {
        type: Schema.Types.ObjectId, ref: 'Login'
    },
    refreshToken: {
        type: String
    },
    userType:{
        type: Schema.Types.ObjectId, ref: 'UserTypes'
    }
})

const User = mongoose.model('User', userSchema);
module.exports = User;

