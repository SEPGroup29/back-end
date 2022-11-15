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
        type: Number,
        default: 0
    },
    dstock: {
        type: Number,
        default: 0
    },
    rpstock: {
        type: Number,
        default: 0
    },
    rdstock: {
        type: Number,
        default: 0
    },
    tempPetrolStock: {
        type: Number,
        default: 0
    },
    tempDieselStock: {
        type: Number,
        default: 0
    }
});

const FuelStation = mongoose.model('FuelStation', fuelStationSchema);

module.exports = FuelStation;