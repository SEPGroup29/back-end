const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pummpOperatorSchema = new Schema({
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

const PumpOperator = mongoose.model('PumpOperator', pummpOperatorSchema);
module.exports = PumpOperator;