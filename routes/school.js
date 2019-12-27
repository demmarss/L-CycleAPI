const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const {School} = require('../models/schools')
const _ = require('lodash');
const path = require("path");
const {User} = require('../models/user');

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
    const schools = await School.find()
       res.send(schools)
  });

//create a expenses with file if exist
var cpUpload1 = upload.fields([{ name: 'schoolLogo', maxCount: 1 }])

router.post('/', cpUpload1, async (req, res) => {

    let school = new School({ 
        logoFilename: req.files.schoolLogo[0].filename,
        schoolName: req.body.schoolName,
        moto: req.body.moto,
        date: new Date(),
        abreviation: req.body.abreviation
      });

      school = await school.save();

      console.log('Saved school', school)

            /////////////////////////////////////////////
      // I need to register the user as the admin
      let user = new User(_.pick(req.body, ['username', 'password', 'role', 'code', 'address', 'parentId', 'grade', 'name', 'mobile', 'affiliationId']));
  
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        user.affiliationId = school._id

        
        await user.save();

        console.log('created user', user)

      res.send(school)
});

module.exports = router;
