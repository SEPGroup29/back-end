const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vehicleTypesSchema = new Schema({
    type:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    fuelAllocation: {
        type: Number,
        required: true
    }

})

const VehicleTypes = mongoose.model('VehicleTypes', vehicleTypesSchema);
module.exports = VehicleTypes;