const Joi = require('joi');
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  author: {
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
    author: Joi.string().min(5).max(50).required()
  };

  return Joi.validate(task, schema);
}

exports.Task = Task; 
exports.validate = validateTask;