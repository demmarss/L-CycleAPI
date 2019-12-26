const express = require('express');
const router = express.Router();
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
router.get('/', async (req, res) => {
    const expenses = await Expenses.find()
       res.send(expenses)
  });

//create a expenses with file if exist
var cpUpload1 = upload.fields([{ name: 'expenseSupportDoc', maxCount: 1 }])

router.post('/', cpUpload1, async (req, res) => {

    console.log('Required dot body', req.body)

    console.log('Required dot files',  req.files.expenseSupportDoc[0])

    let expense = new Expenses({ 
        supportDoc: req.files.expenseSupportDoc[0].filename,
        amount: req.body.amount,
        description: req.body.description,
        date: new Date(),
      });
      expense = await expense.save();
      res.send(expense)
});

module.exports = router;
