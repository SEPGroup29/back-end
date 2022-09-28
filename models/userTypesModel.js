const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userTypesSchema = new Schema({
    id:{
        type: Number,
        required: true
    },
    type:{
        type: String,
        required: true
    }
})

const UserTypes = mongoose.model('UserTypes', userTypesSchema);
module.exports = UserTypes;