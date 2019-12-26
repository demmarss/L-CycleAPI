const express = require('express');
const router = express.Router();
const {Payment} = require('../models/payment')

// get all the payments
router.get('/', async (req, res) => {
    const payments = await Payment.find()
       res.send(payments)
  });

//create a payment
router.post('/', async (req, res) => {
    console.log(req.body)
    let payment = new Payment({ 
        amount: req.body.amount,
        monthPaidFor: req.body.monthPaidFor,
        collectorId: req.body.collectorId,
        parentId: req.body.parentId,
        paymentDate: new Date(),
        yearPaidFor: req.body.year
      });
      payment = await payment.save();
      res.send(payment)
});

module.exports = router;
