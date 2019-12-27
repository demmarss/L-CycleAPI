const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  role: {
    type: String,
  },
  username: {
    type: String,
  },
  password: {
    type: String,
  },
  mobile: {
    type: String
  },
  code: {
    type: String
  },
  parentId: {
    type: String
  },
  address: {
    type: String
  },
  grade: {
    type: String
  },
  affiliationId: {
    type: String
  },
  isAdmin: Boolean
});

userSchema.methods.generateAuthToken = function() { 
  const token = jwt.sign({ _id: this._id, username: this.username, role: this.role, affiliationId: this.affiliationId }, config.get('jwtPrivateKey'));
  return token;
}

const User = mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = {
    username: Joi.string().min(2).max(50).required(),
    password: Joi.string().min(2).max(255).required(),
    role: Joi.string().min(2).max(255).required(),
    code: Joi.string().min(0).max(255).required(),
    address: Joi.string().min(0).max(255).required(),
    parentId: Joi.string().min(0).max(255).required(),
    name: Joi.string().min(0).max(255).required(),
    mobile: Joi.string().min(0).max(255).required(),
    grade: Joi.string().min(0).max(255).required(),
    affiliationId: Joi.string().min(0).max(255).required()
  };

  return Joi.validate(user, schema);
}

exports.User = User; 
exports.validate = validateUser;