const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vehicleSchema = new Schema({
    regNo:{
        type: String,
        required: true
    },
    chassisNo:{
        type: String,
        required: true
    },
    vehicleType:[
        {type: Schema.Types.ObjectId, ref: 'VehicleTypes'}
    ],
    fuelType:{
        type: String,
        required: true
    },
    vehicleOwnerId: [
        {type: Schema.Types.ObjectId, ref: 'VehicleOwner'}
    ],
    queuePosition:{
        type: Number,
    },
    queueId: [
        {type: Schema.Types.ObjectId, ref: 'Vehicle'}
    ]
})

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
module.exports = Vehicle;