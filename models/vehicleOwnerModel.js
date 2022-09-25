const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vehicleOwnerSchema = new Schema({
    NIC: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    consumedPQ: {
        type: Number,
    },
    consumedDQ: {
        type: Number,
    },
    vehicles: [
        {type: Schema.Types.ObjectId, ref: 'Vehicle'}
    ],
    fuelQuota: [
        {type: Schema.Types.ObjectId, ref: 'FuelQuota'}
    ]

})

const VehicleOwner = mongoose.model('VehicleOwner', vehicleOwnerSchema);

module.exports = VehicleOwner;