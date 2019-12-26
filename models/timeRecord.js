const mongoose = require('mongoose');

const timeRecordSchema = new mongoose.Schema({
    userId: {
        type: String
    },
    timeIn: {
        type: String
    },
    timeOut: {
        type: String
    }
});

const TimeRecord = mongoose.model('TimeRecord', timeRecordSchema);

exports.TimeRecord = TimeRecord;
