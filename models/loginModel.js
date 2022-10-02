const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const loginSchema = new Schema({
    loginType: {
        type : Number,
        required: true,
    },
    value: {
        type : String,
        required: true,
    }
})

const Login = mongoose.model('Login', loginSchema);
module.exports = Login;