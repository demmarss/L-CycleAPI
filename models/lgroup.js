const Joi = require('joi');
const mongoose = require('mongoose');

const lgroupSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  groupName: {
    type: String,
    required: true,
  },
  member: {
    type: []
  },
  task: {
    type: []
  },
  code: {
    type: String,
    required: true,
  },



  
});

const Lgroup = mongoose.model('Lgroup', lgroupSchema);

function validateLgroup(lgroup) {
  const schema = {
    author: Joi.string().min(5).max(50).required()
  };

  return Joi.validate(lgroup, schema);
}

exports.Lgroup = Lgroup; 
exports.validate = validateLgroup;