const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  role: {
    type: String,
    required: true
  },
  address: {
    type: String,
  },
  email: {
    type: String,
  },
  phonenumber: {
    type: String
  },
  code:{
      type: String
  },
  kidsIds: {
      type: []
  },
  grade: {
      type: String
  },
  pic: {
      type: String
  },
  parentCode: {
    type: String
  },

});


const LmsUser = mongoose.model('LmsUser', userSchema);

exports.LmsUser = LmsUser;