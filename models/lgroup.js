const Joi = require('joi');
const mongoose = require('mongoose');

const lgroupSchema = new mongoose.Schema({
  authorId: {
    type: String
  },
  lgtitle: {
    type: String,
    required: true,
  },
  members: {
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
    lgtitle: Joi.string().min(5).max(50)
  };

  return Joi.validate(lgroup, schema);
}

exports.Lgroup = Lgroup; 
exports.validate = validateLgroup;