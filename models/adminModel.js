const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    id:{
        type: Number,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    userType:{
        type: Schema.Types.ObjectId, ref: 'UserTypes'
    }
})

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;