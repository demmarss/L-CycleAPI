const express = require('express');
const tasks = require('../routes/tasks');
const lgroups = require('../routes/lgroups');
const users = require('../routes/users');
const mmnewapi = require('../routes/mmnewapi');
const times = require('../routes/timeRecord')
const payments = require('../routes/payment')
const expenses = require('../routes/expenses')
const auth = require('../routes/auth');
const error = require('../middleware/error');

module.exports = function(app) {
  app.use(express.json());
  app.use('/api/users', users);
  app.use('/api/tasks', tasks);
  app.use('/api/lgroups', lgroups);
  app.use('/api/mmnewapi', mmnewapi);
  app.use('/api/auth', auth);
  app.use('/api/expenses', expenses);
  app.use('/api/times', times);
  app.use('/api/payments', payments);
  app.use(error);
}