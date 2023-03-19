const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rsvpSchema = new Schema({
    response: {type: String, required: [true, 'rsvp response is required'], enum: ['yes', 'no'] },
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    program: {type: Schema.Types.ObjectId, ref: 'Program'}
});

module.exports = mongoose.model('RSVP', rsvpSchema);