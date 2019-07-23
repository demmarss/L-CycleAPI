const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const {User, validate} = require('../models/user');
const express = require('express');
const router = express.Router();

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.send(user);
});

router.post('/getManyUsers', auth, async (req, res) => {
 
  const allusers = await User.find().select('-password')
  let users=[]
  
  req.body.userIdArray.map(memberId => 
    users = users.concat(allusers.filter(user=> user._id == memberId))
    )
 
  res.send(users);
});


router.post('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ username: req.body.username });
  if (user) return res.status(400).send('User already registered.');

  user = new User(_.pick(req.body, ['username', 'password', 'role']));

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res.header('x-auth-token', token).send(_.pick(user, ['_id', 'username']));
});

module.exports = router; 
