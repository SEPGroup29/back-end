const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const queueSchema = new Schema({
    queueType: {
        type: String,
        required: true
    },
    fuelStationId: {
        type: Schema.Types.ObjectId, ref: 'FuelStation',
        required: true
    },
    active: {
        type: Boolean,
        required: true
    }

})

const Queue = mongoose.model('Queue', queueSchema);
module.exports = Queue;