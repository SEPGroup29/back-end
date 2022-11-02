const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const registeredVehiclesSchema = new Schema({
    chassisNo: {
        type: String,
        required: true
    },
    regNo: {
        type: String,
        required: true
    }
})

const RegisteredVehicles = mongoose.model('RegisteredVehicles', registeredVehiclesSchema);
module.exports = RegisteredVehicles;