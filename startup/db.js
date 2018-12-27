const winston = require('winston');
const mongoose = require('mongoose');

module.exports = function() {
  const config = {
    autoIndex: false,
    useNewUrlParser: true,
  }
  mongoose.connect('mongodb://localhost/lcycle', config)
    .then(() => winston.info('Connected to MongoDB...'));
}