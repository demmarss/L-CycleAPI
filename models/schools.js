const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
schoolName: {
    type: String,
    required: true,
  },
  date: {
    type: String,
  },
  abreviation: {
    type: String,
    required: true,
  },
  moto:{
      type:String
  },
  logoFilename:{
      type:String
  }
});

const School = mongoose.model('School', schoolSchema);

exports.School = School; 
