const Joi = require('joi');
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
  },
  description: {
    type: String,
  },
  questionType: {
    type: String,
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
  },
  answerHistory: {
    type: []
  },
  lgroupId: {
    type: [],
  },
  multiAttempt: {
    type: Boolean,
  } 
});

const Task = mongoose.model('Task', taskSchema);

function validateTask(task) {
  const schema = {
    user: Joi.string().min(5).max(50).required(),
    topic: Joi.string(),
    questions: Joi.array(),
    scoreHistory: Joi.array(),
    topic: Joi.string()
  };

  return Joi.validate(task, schema);
}

exports.Task = Task; 
exports.validate = validateTask;