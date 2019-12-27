const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const {User, validate} = require('../models/user');
const {LmsUser} =  require('../models/lmsuser')
const express = require('express');
const router = express.Router();
const path = require("path");
const {Lgroup} = require('../models/lgroup');


const multer = require("multer");

let storage = multer.diskStorage({
  destination: "./public/uploadsLMS/",
  filename: function(req, file, cb){
     cb(null,"LMS-" + Date.now() + path.extname(file.originalname));
  }
});

var upload = multer({ storage: storage })

// get all the users
router.get('/', auth, async (req, res) => {
  const users = await User.find().select('-password')
  const usersHere = users.filter(user => user.affiliationId === req.user.affiliationId)
  res.send(usersHere)
});

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

  const userHere = req.body.user

  const { error } = validate(userHere); 

  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ username: req.body.user.username });

  if (user) return res.status(400).send('User already registered.');
  user = new User(_.pick(req.body.user, ['username', 'password', 'role', 'code', 'address', 'parentId', 'grade', 'name', 'mobile', 'affiliationId']));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();
  const token = user.generateAuthToken();
  res.header('x-auth-token', token).send(user);
});

// Admin create student and assign to lgroup
router.post('/byAdmin', auth, async (req, res) => { 

  const user0 = req.body
  const { error } = validate(user0); 
  if (error) return res.status(400).send(error.details[0].message);
  let user = new User(_.pick(user0, ['username', 'password', 'role', 'code', 'address', 'parentId', 'grade', 'name', 'mobile', 'affiliationId']));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();
  
  // Now joing the user to the learning group member

  // Get lgs that belong to this affilition,
    const query = { affiliationId: req.user.affiliationId};
    let lgrouPs = await Lgroup.find(query)
    // Get one-lg that belong to user.grade
    let lgroup = lgrouPs.find(lg=> lg.lgtitle === user.grade)
  // update the one-lg member with user.id

  const newLgMember = [...lgroup.members, user._id]

    Lgroup.where({ _id: lgroup._id }).updateOne({ members:  newLgMember }).exec()

  // Now get lgs that belong to this affiliation 
    const query2 = { affiliationId: req.user.affiliationId};
    let lgroups = await Lgroup.find(query2)

  res.send({user, lgroups});
});


var cpUpload1 = upload.fields([{ name: 'pic', maxCount: 1 }])
router.post('/createLMSUser', cpUpload1, async (req, res) => {
 const userReceived = req.body
 if (userReceived.role == "parent"){
  user = new LmsUser({
    firstname: userReceived.firstname,
    lastname: userReceived.lastname,
    address: userReceived.address,
    phonenumber: userReceived.mobile,
    email: userReceived.email,
    role: userReceived.role,
    code: Date.now()
  });
  await user.save();
  res.send({user})
 }else if(userReceived.role == "staff"){
  user = new LmsUser({
    firstname: userReceived.firstname,
    lastname: userReceived.lastname,
    address: userReceived.address,
    phonenumber: userReceived.mobile,
    email: userReceived.email,
    role: userReceived.role,
    code: Date.now(),
    pic: req.hasOwnProperty("files")? req.files.pic[0].filename: null,
  })
  await user.save();
  res.send({user})

}else if(userReceived.role == "student"){
  
  user = new LmsUser({
    firstname: userReceived.firstname,
    lastname: userReceived.lastname,
    grade: userReceived.grade,
    parentCode: userReceived.parentCode,
    // pic: req.hasOwnProperty("files")? req.files.pic[0].filename: null,
    role: userReceived.role,
    code: Date.now()
  });
  await user.save();

  

  res.send({user})
 }
});



router.post('/paymentToLmsUsers', async (req, res) => {
  
  const user = await LmsUser.findById(req.body.parentId)

   user.paymentHistory.push(req.body.payment)

   LmsUser.where({ _id: req.body.parentId}).updateOne({ paymentHistory: user.paymentHistory }).exec()

  res.send({user});
});

router.post('/LmsUsers', async (req, res) => {
  const users = await LmsUser.find()
  res.send({users});

});

module.exports = router; 
