const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fuelQuotaSchema = new Schema({
    EPQ: {
        type: Number,
    },
    EDQ: {
        type: Number,
    }
})

const FuelQuota = mongoose.model('FuelQuota', fuelQuotaSchema);
module.exports = FuelQuota;