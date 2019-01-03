const Joi = require('joi');
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  user: {
    type: String,
    required: true,
  },
  questions: {
    type: []
  },
  scoreHistory: {
    type: []
  }  
});

const Task = mongoose.model('Task', taskSchema);

function validateTask(task) {
  const schema = {
    user: Joi.string().min(5).max(50).required(),
    topic: Joi.string().min(5).max(50).required(),
    questions: Joi.array(),
    scoreHistory: Joi.array()
  };

  return Joi.validate(task, schema);
}

exports.Task = Task; 
exports.validate = validateTask;