const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const path = require("path");


const multer = require("multer");

let storage = multer.diskStorage({
  destination: "./public/uploadsLMS/",
  filename: function(req, file, cb){
     cb(null,"LMS-" + Date.now() + path.extname(file.originalname));
  }
});

var upload = multer({ storage: storage })

router.get('/solahTime', (req, res) => {

    let solahTime = [3,2,3,4,5]
    res.send(solahTime);
});

router.post('/getManyUsers', auth, async (req, res) => {
 
  const allusers = await User.find().select('-password')
  let users=[]
  
  req.body.userIdArray.map(memberId => 
    users = users.concat(allusers.filter(user=> user._id == memberId))
    )
 
  res.send(users);
});

module.exports = router; 