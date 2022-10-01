const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pummpOperatorSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId, ref: 'User'
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
    }
})

const PumpOperator = mongoose.model('PumpOperator', pummpOperatorSchema);
module.exports = PumpOperator;