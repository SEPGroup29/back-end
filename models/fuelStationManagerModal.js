const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fuelStationManagerSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    contactNumber: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    fuelStationId: {
        type: Schema.Types.ObjectId, ref: 'FuelStation'
    },
    userType:{
        type: Schema.Types.ObjectId, ref: 'UserTypes'
    }
})

const fuelStationManager = mongoose.model('FuelStationManager', fuelStationManagerSchema);
module.exports = fuelStationManager;