const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {Expenses} = require('../models/expenses')
const path = require("path");

const multer = require("multer");

let storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function(req, file, cb){
     cb(null,"IMAGE-" + Date.now() + path.extname(file.originalname));
  }
});

var upload = multer({ storage: storage })


// get all the payments
router.get('/', auth, async (req, res) => {
    const expenses = await Expenses.find()
    const expensesHere = expenses.filter(expense => expense.affiliationId === req.user.affiliationId)
       res.send(expensesHere)
  });

//create a expenses with file if exist
var cpUpload1 = upload.fields([{ name: 'expenseSupportDoc', maxCount: 1 }])

router.post('/', auth, cpUpload1, async (req, res) => {

    let expense = new Expenses({ 
        supportDoc: req.files.expenseSupportDoc!== undefined? req.files.expenseSupportDoc[0].filename: null,
        amount: req.body.amount,
        description: req.body.description,
        date: new Date(),
        affiliationId: req.user.affiliationId
      });
      expense = await expense.save();
      res.send(expense)
});

module.exports = router;
