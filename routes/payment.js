const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {Payment} = require('../models/payment')

// get all the payments
router.get('/', auth, async (req, res) => {
    const payments = await Payment.find()
    const paymentsHere = payments.filter(payment => payment.affiliationId === req.user.affiliationId)
       res.send(paymentsHere)
  });

//create a payment
router.post('/', async (req, res) => {
    let payment = new Payment({ 
        amount: req.body.amount,
        monthPaidFor: req.body.monthPaidFor,
        collectorId: req.body.collectorId,
        parentId: req.body.parentId,
        paymentDate: new Date(),
        yearPaidFor: req.body.year, // array of taskIds
        affiliationId: req.user.affiliationId
      });
      payment = await payment.save();
      res.send(payment)
});

module.exports = router;
