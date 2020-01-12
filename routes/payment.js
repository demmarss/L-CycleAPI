const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {Payment} = require('../models/payment')

// get all the payments
router.get('/', auth, async (req, res) => {
    const payments = await Payment.find()
    const paymentsHere = payments.filter(payment => payment.affiliationId === req.user.affiliationId)
    console.log('payment here', paymentsHere)
       res.send(paymentsHere)
  });

//create a payment
router.post('/', auth, async (req, res) => {

    let payment = new Payment({ 
        amount: req.body.amount,
        monthPaidFor: req.body.monthPaidFor,
        collectorId: req.user._id,
        parentId: req.body.parentId,
        paymentDate: new Date(),
        yearPaidFor: req.body.year, // array of taskIds
        affiliationId: req.user.affiliationId
      });
      payment = await payment.save();
      res.send(payment)
});

//create a payment
router.put('/', auth, async (req, res) => {

  console.log('Req . body ', req.body)

  let editPayment = { 
      amount: req.body.amount
    };

  const query = {_id: req.body._id}

  Payment.findOneAndUpdate(query, editPayment).exec()

  payment = await Payment.findOne(query);

  console.log("updated payment", payment)

  res.send(payment)
});

module.exports = router;
