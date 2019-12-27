const express = require('express');
const router = express.Router();
const {TimeRecord} = require('../models/timeRecord')
const {User} = require('../models/user')
    

// get all the times
router.get('/', async (req, res) => {
    const timeRecords = await TimeRecord.find()
    res.send(timeRecords)
  });

// Create or update time record
router.post('/', async (req, res) => {

  //    Get all records
  const timeRecords = await TimeRecord.find()

  const user = await User.findById(req.body.userID)
  
  // get all users
  const users = await User.find()

  let userRecords = []

  if (user.role === 'Parent'){
    userRecords = getKidsRecords(user._id, timeRecords, users)
  }else{
    //    Get all records for this user
    userRecords = timeRecords.filter(record=> record.userId == req.body.userID)
  }
  
   
  // Try to see if there is any record in last 12 hr to update the timeOut
  let recordsToUdate = getRecordToUpdate(userRecords)
   
  // Update any record with timeOut, else create a new record
  let updatedRecords = []
  if (recordsToUdate.length >0) {
      recordsToUdate.map( async record =>{
        TimeRecord.where({ _id: record._id }).updateOne({ timeOut: new Date() }).exec()
        const timeRecord = await TimeRecord.findById(record._id) 
        updatedRecords.push(timeRecord) 
      })
    res.send(updatedRecords)
  }else{
    let timeRecord = new TimeRecord({ 
      userId: req.body.userID,
      timeIn:new Date(),
      timeOut: ''
    });
    timeRecord = await timeRecord.save();
    res.send(timeRecord)
  }  
});


// // create timeOut for kid pickUp
// router.post('/timeOutStudent', async (req, res)=>{
//   // req.body.parentId
//   const users = await User.find()
  
//   // find kid(s) 
//   const kids = users.filter(x=> x.parentId === req.body.parentId)

//   // Get all time records of kids
//   let kidsTimeRecords =[]
//     if (kids.length > 0){

//       kids.map(async kid=>
//         {
//           let timeRecord = new TimeRecord({ 
//             userId: kid._id,
//             timeIn: '',
//             timeOut: new Date()
//           });
//           timeRecord = await timeRecord.save();
//           kidsTimeRecords.push(timeRecord)
//         })
//     }
//    res.send(kidsTimeRecords)
// })


  // if parent, get all records for the kids
  function  getKidsRecords (userId, timeRecords, users){

    // find kid(s) 
  const kids = users.filter(x=> x.parentId === userId)
      if (kids.length>0){
        let result = []
        kids.map(kid=> {
          let kidRecords = timeRecords.filter(record=> record.userId == kid._id)
          result = [...result, ...kidRecords]
        })
      }

      return result
  }


function getRecordToUpdate (userRecords){
  let result = []
  for (x=0; x< userRecords.length; x++){
    let hourDiff = ((new Date().getTime() - new Date(userRecords[x].timeIn).getTime())/7200000)
    if(hourDiff < 12){
      result.push(userRecords[x])
    }
  }
return result
}

module.exports = router; 