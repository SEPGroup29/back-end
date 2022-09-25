const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const queueSchema = new Schema({
    queueType: {
        type: String,
        required: true
    },
    vehicles:[
        {type: Schema.Types.ObjectId, ref: 'Vehicle'}
    ]
})

const Queue = mongoose.model('Queue', queueSchema);
module.exports = Queue;