const express = require('express');
const tasks = require('../routes/tasks');
const lgroups = require('../routes/lgroups');
const users = require('../routes/users');
const auth = require('../routes/auth');
const error = require('../middleware/error');

module.exports = function(app) {
  app.use(express.json());
  app.use('/api/users', users);
  app.use('/api/tasks', tasks);
  app.use('/api/lgroups', lgroups);
  app.use('/api/auth', auth);
  app.use(error);
}