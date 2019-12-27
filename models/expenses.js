const mongoose = require('mongoose');

const expensesSchema = new mongoose.Schema({
  supportDoc: {
    type: String,
  },
  date: {
    type: String,
  },
  amount: {
    type: String,
    required: true,
  },
  description:{
      type:String
  },
  affiliationId: {
    type: String
  },
});

const Expenses = mongoose.model('Expenses', expensesSchema);

exports.Expenses = Expenses; 
