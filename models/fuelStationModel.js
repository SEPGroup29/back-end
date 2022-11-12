const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fuelStationSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    nearCity: {
        type: String,
        required: true
    },
    ownerName: {
        type: String,
        required: true
    },
    pstock: {
        type: Number
    },
    dstock: {
        type: Number
    },
    rpstock: {
        type: Number
    },
    rdstock: {
        type: Number
    }
});

const FuelStation = mongoose.model('FuelStation', fuelStationSchema);

module.exports = FuelStation;