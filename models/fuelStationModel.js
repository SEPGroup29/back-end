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
        required: true
    },
    dstock: {
        type: Number,
        required: true
    },
    rpstock: {
        type: Number,
        required: true
    },
    rdstock: {
        type: Number,
        required: true
    },
    queues: [
        {type: Schema.Types.ObjectId, ref: 'Queue'}
    ],
    manager: [
        {type: Schema.Types.ObjectId, ref: 'Manager'}
    ],
    pumpOperators: [
        {type: Schema.Types.ObjectId, ref: 'PumpOperator'}
    ]
});

const FuelStation = mongoose.model('FuelStation', fuelStationSchema);

module.exports = FuelStation;