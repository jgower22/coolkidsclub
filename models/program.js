const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const programSchema = new Schema({
    name: {type: String, required: [true, 'name is required']},
    location: {type: String, required: [true, 'location is required']},
    startDate: {type: String, required: [true, 'startDate is required']},
    endDate: {type: String, required: [true, 'endDate is required']},
    startTime: {type: String, required: [true, 'start time is required']},
    endTime: {type: String, required: [true, 'end time is required']},
    details: {type: String, required: [true, 'details is required']},
    createdBy: {type: Schema.Types.ObjectId, ref: 'User'},
    lastModifiedBy: {type: Schema.Types.ObjectId, ref: 'User'}
},
{timestamps: true}
);

module.exports = mongoose.model('Program', programSchema);