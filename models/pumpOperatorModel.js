const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pummpOperatorSchema = new Schema({
    password: {
        type: String,
        required: true
    }
})

const PumpOperator = mongoose.model('PumpOperator', pummpOperatorSchema);
module.exports = PumpOperator;