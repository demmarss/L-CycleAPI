const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    minlength: 5,
    maxlength: 50
  },
  lastname: {
    type: String,
    minlength: 5,
    maxlength: 50
  },
  role: {
    type: String,
    required: true
  },
  username: {
    type: String,
    minlength: 5,
    maxlength: 50
  },
  email: {
    type: String,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  phonenumber: {
    type: String
  },
  // ,
  // isAdmin: Boolean
});

userSchema.methods.generateAuthToken = function() { 
  const token = jwt.sign({ _id: this._id, username: this.username, role: this.role }, config.get('jwtPrivateKey'));
  return token;
}

const User = mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = {
    username: Joi.string().min(5).max(50).required(),
    password: Joi.string().min(5).max(255).required(),
    role: Joi.string().min(5).max(255).required(),
  };

  return Joi.validate(user, schema);
}

exports.User = User; 
exports.validate = validateUser;