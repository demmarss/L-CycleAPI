const {Task, validate} = require('../models/task');
const {Lgroup} = require('../models/lgroup'); 
const {User} = require('../models/user');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const path = require("path");
var fs = require("fs");
var findRemoveSync = require('find-remove')

const multer = require("multer");

let storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function(req, file, cb){
     cb(null,"IMAGE-" + Date.now() + path.extname(file.originalname));
  }
});

var upload = multer({ storage: storage })


router.get('/', async (req, res) => {
  const tasks = await Task.find().sort('name');
  res.send(tasks);
});

// creating a task and add it to its learning group
router.post('/', auth, async (req, res) => { 
  const { error } = validate(req.body.task); 
  if (error) return res.status(400).send(error.details[0].message);

  let task = new Task({ 
    topic: req.body.task.topic,
    user: req.user._id, // this should be userId
    questions: req.body.task.questions,
    scoreHistory: req.body.task.scoreHistory,
    lgroupId: [req.body.lgroupId]
  });

  task = await task.save();

    const lgroup = await Lgroup.findById(req.body.lgroupId)

    lgroup.task.push(task._id)

    Lgroup.where({ _id: lgroup._id }).updateOne({ task:  lgroup.task }).exec()

    // Get lgroups for this user
    const allLgroups = await Lgroup.find()

    const lgroups = allLgroups.filter(group=> (group.members).indexOf(req.params.userId)>-1)
  
    if (!lgroups) return res.status(404).send('You do not have any learning group');
        
  res.send({task, lgroups});
});

// create task main info that will later contain Pictures or Sounds references
router.post('/creatTaskMainInfo', auth, async (req, res)=>{

  let task = new Task({
    topic: req.body.taskMainInfo.topic,
    user: req.user._id,
    questionType: req.body.taskMainInfo.questionType,
    subject: req.body.taskMainInfo.subject,
    description: req.body.taskMainInfo.description,
    lgroupId: [],
    questions: [],
    scoreHistory: [],
    answerHistory: [],
    answers: {}
  })

  task = await task.save()

  res.send({task})
})

// creating a task With images dont add it to learning group
var cpUpload = upload.fields([{ name: 'questionImage', maxCount: 1 }, { name: 'answerImage', maxCount: 1 }])

router.post('/saveImages', cpUpload, async (req, res) => {

  // find the task
      const task = await Task.findById(req.body.taskId);

      if (!task) return res.status(404).send('The task with the given ID was not found.');
        
      // create a question using the reference to the Files names and location
      let question = {
        questionImageName: req.files.questionImage[0].filename,
        answerImageName: req.files.answerImage[0].filename,
        timeRequired: req.body.timeRequired,
      }

  // append to task.questions
      task.questions.push(question)

  // update the task
    Task.where({ _id: req.body.taskId}).updateOne({ questions: task.questions }).exec()

  res.send({task})
})

var cpUpload1 = upload.fields([{ name: 'questionImage', maxCount: 1 }])
router.post('/saveImage1', cpUpload1, async (req, res) => {

  console.log(req.body)

  console.log(req.files)

  // find the task
      const task = await Task.findById(req.body.taskId);

      if (!task) return res.status(404).send('The task with the given ID was not found.');
        
      // create a question using the reference to the Files names and location
      let question = {
        questionImageName: req.files.questionImage[0].filename,
        timeRequired: req.body.timeRequired,
      }

  // append to task.questions
      task.questions.push(question)
  // update the task
    Task.where({ _id: req.body.taskId}).updateOne({ questions: task.questions }).exec()
  res.send({task})
})

// Updating task with score History
storage = multer.diskStorage({
  destination: "./public/uploads/audio/",
  filename: function(req, file, cb){
     cb(null,"Audio-" + Date.now() + path.extname(file.originalname));
  }
});

upload = multer({ storage: storage })

router.put('/addAudioResponse/:id', auth, upload.single('soundBlob'), async(req, res)=>{
  
  const taskId = req.params.id;
  let task = await Task.findById(taskId);
  const userId = req.user._id

  let users =getUsersFromTaskAnswerHistory(task.answerHistory)
  let AudioResponse =[]
  let index = -1
  
  // check if user alread start answering
  if(users.indexOf(userId)>-1){
    // identify the object index of element that has userId as it key in the taskArray, which should be thesame as the indext from the users (ealier found)
    // use this index value to point to the object in the task answer history
    index = users.indexOf(userId)
    // access the response as make it equat to the response. 
      AudioResponse = task.answerHistory[index][userId].audioResponse

      // Create a new answer object, but the audioResponse is updated
      const answer = {
        [userId]: {
          audioResponse: [...AudioResponse, req.file.filename],
          timeRequired: req.body.timeRequired,
        }
      }

      // Replace the task.answerHistory with the newly created answer
      task.answerHistory.splice(index, 1, answer)

  }else{
    // start new answer for this user
      const answer = {
        [userId]: {
          audioResponse: [req.file.filename],
          timeRequired: req.body.timeRequired,
        }
      }
      task.answerHistory.push(answer)
  }
  
  Task.where({ _id: taskId}).updateOne({ answerHistory: task.answerHistory }).exec()
  task = await Task.findById(taskId)

res.send(task);

})


// Trying to add option
router.put('/addOption', auth, async (req, res) => {
  
  let task = await Task.findById(req.body.taskId)

      task = buildOptionToTask(task)

      task = await Task.findById(req.body.taskId)
  
  res.send({task})

})

// Trying to assign lgroup to task
router.put('/assignLgroup', auth, async (req, res) => { 
  
  let task = await Task.findById(req.body.taskId)

  if((task.lgroupId).indexOf(req.body.lgroupId)<=-1){
    task.lgroupId.push(req.body.lgroupId)
  }


  Task.where({ _id: task._id }).updateOne({ lgroupId:  task.lgroupId }).exec()

  task = await Task.findById(req.body.taskId)


    const lg = await Lgroup.findById(req.body.lgroupId)
    
    if((lg.task).indexOf(task._id)<=-1){
      lg.task.push(task._id)
    }
    
    Lgroup.where({ _id: lg._id }).updateOne({ task:  lg.task }).exec()

    const lgroup = await Lgroup.findById(req.body.lgroupId)
    
        
  res.send({task, lgroup});
});

// remove the assigned lgroup from task
router.put('/removeAssignLgroup', auth, async (req, res) => { 
  let task = await Task.findById(req.body.taskId)
    task.lgroupId = task.lgroupId.filter(x=> x !== req.body.lgroupId)
    Task.where({ _id: task._id }).updateOne({ lgroupId: task.lgroupId }).exec()
  const lg = await Lgroup.findById(req.body.lgroupId)



/////////////////////////////////////////////////////////////////////////////////////

// delete audioResponses from task.answerHistory for the lg.members
  // first get all audio response by all the lg.members
  let allAudioResponses=[]
  let LgMemberThatAnswerTask =  getLgMemberThasAnswerTask(task, lg)
  LgMemberThatAnswerTask.map(member=>{
    allAudioResponses = allAudioResponses.concat(getUserAudioResponse(task, member))
  })
  // delete the Audio responses
  allAudioResponses.map(response =>{
    findRemoveSync('./public/uploads/audio', {files: response})
    } 
  )

////////////////////////////////////////////////////////////////////////////////////

// To delete answers if the lgroup is removed from task 
// Get an array of index when the Lgroup member are at taskAnswers users
// User this index to splice the taskAnswer
let arrayOfIndex=[]
let allCandidates = []

for(let i=0; i<task.answerHistory.length; i++){
  allCandidates = allCandidates.concat(Object.keys(task.answerHistory[i])) 
}
                                                          
for (let i =0 ; i<lg.members.length; i++){
  for(let j=0; j<allCandidates.length; j++){
    if(lg.members[i] == allCandidates[j]){
      arrayOfIndex.push(j)
    }
  }
}

arrayOfIndex.map(index=> task.answerHistory.splice(index, 1))

Task.where({ _id: task._id }).updateOne({ answerHistory: task.answerHistory }).exec()



// delete task from learning group also    
let updatedlgrouptask = lg.task.filter(taskId => JSON.stringify(taskId) !== JSON.stringify(task._id))
    Lgroup.where({ _id: lg._id }).updateOne({ task: updatedlgrouptask }).exec()
    const lgroup = await Lgroup.findById(req.body.lgroupId)  
  res.send({task, lgroup});
});

function getLgMemberThasAnswerTask (task, group) {
  // if and then statement
  let commonUserArray=[]
  let allUserAnswerArray = []

  for(let i=0; i<task.answerHistory.length; i++){
      allUserAnswerArray = allUserAnswerArray.concat(Object.keys(task.answerHistory[i]))
  }  
  allUserAnswerArray.map(user=> {
      group.members.map(member=> {
          if (user == member){
              commonUserArray.push(user)
          }
      })
  })

  return commonUserArray
  }

function getUserAudioResponse (Task, UserId) {
  const UserAnswer = Task.answerHistory.find((elm)=> elm[UserId])
  return(Object.values(UserAnswer)[0].audioResponse)
}


// deleting a task and the taskId from its respective lgroup
router.delete('/:id', auth, async (req, res) => {
  query = { _id: req.params.id}
  
  const task = await Task.findOneAndDelete(query);

  // loop through the questions and check if it has images, then delete if yes
  task.questions.map(question =>{
    if (Object.keys(question).indexOf("questionImageName")>-1) {findRemoveSync('./public/uploads', {files: question.questionImageName})}
    if (Object.keys(question).indexOf("answerImageName")>-1) {findRemoveSync('./public/uploads', {files: question.answerImageName})} 
    } 
  )

  //////////////////////////////////////////////////////////////////////////////////////
  // All the audio responses that the students have created must be deleted
    // ?????????????????????????????????????????????????????
    // get all answers
    let allUserAnswerArray = []
        for(let i=0; i<task.answerHistory.length; i++){
            allUserAnswerArray = allUserAnswerArray.concat(Object.keys(task.answerHistory[i]))
        }
      // first get all audio response by all the lg.members
      let allAudioResponses=[]
      allUserAnswerArray.map(user=>{
        allAudioResponses = allAudioResponses.concat(getUserAudioResponse(task, user))
      })

      // delete the Audio responses
      allAudioResponses.map(response =>{
        findRemoveSync('./public/uploads/audio', {files: response})
        } 
      )

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  if (!task) return res.status(404).send('The task with the given ID was not found.');

  // delete task from learning group also
  if (task.lgroupId !== []){
    task.lgroupId.map(async lgroupIdd =>{
      let lgroup = await Lgroup.findById(lgroupIdd)
      let updatedlgrouptask = lgroup.task.filter(taskId => JSON.stringify(taskId) !== JSON.stringify(task._id))
      Lgroup.where({ _id: task.lgroupId }).updateOne({ task: updatedlgrouptask }).exec()
      })
    }

  res.send(task); //this should return task
});

//To retrieve all the tasks for a particle user
router.get('/:userId', auth, async (req, res) => {

  // Check if user is a teacher
      const user = await User.findById(req.user._id)

      if (user.role == "Teacher"){
        query = { user: req.user._id}
        tasks = await Task.find(query)
        res.send(tasks)

      }else{
        // Get lgroups for this user
              
        const allLgroups = await Lgroup.find()
          
        const lgroups = allLgroups.filter(group=> (group.members).indexOf(req.params.userId)>-1)
        
        if (!lgroups) return res.status(404).send('You do not have any learning group');

        // to retreive the array of taskIds from the groups
        let arrayOfTaskId = []
        lgroups.map(x=> x.task.map(y=> arrayOfTaskId.push(y)))

        // to retrieve the tasks using their respective taskid from the above array
        let TTTasks = []
        for (i = 0; i < arrayOfTaskId.length; i++){
          TTTasks.push(await Task.findById(arrayOfTaskId[i]))
        }
        
        if (!TTTasks) return res.status(404).send('The task with the given ID was not found.');

        res.send(TTTasks);
      }
 
});


router.get('/:id', async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).send('The task with the given ID was not found.');
  res.send(task);
});

// Updating task with score History
router.put('/:id', auth, async(req, res)=>{

  const taskId = req.params.id;
  const scoreHistory = {
    userId: req.user._id,
    correctedArray: req.body.correctedQuestionArray,
    time: req.body.timeDuration
  }
  
  const task = await Task.findById(taskId);

  task.scoreHistory.push(scoreHistory)

  Task.where({ _id: taskId}).updateOne({ scoreHistory: task.scoreHistory }).exec()

  // Get lgroups for this user   
  const allLgroups = await Lgroup.find()
  
  const lgroups = allLgroups.filter(group=> (group.members).indexOf(req.user._id)>-1)
  
  if (!lgroups) return res.status(404).send('You do not have any learning group');

  // to retreive the array of taskIds from the groups
  let arrayOfTaskId = []
  lgroups.map(x=> x.task.map(y=> arrayOfTaskId.push(y)))

  // to retrieve the tasks using their respective taskid from the above array
  let TTTasks = []
  for (i = 0; i < arrayOfTaskId.length; i++){
    TTTasks.push(await Task.findById(arrayOfTaskId[i]))
  }
  
if (!TTTasks) return res.status(404).send('The task with the given ID was not found.');

res.send(TTTasks);

})


  // Updating task with score History
router.put('/second/:id', auth, async(req, res)=>{

  const taskId = req.params.id;
  const scoreHistory = {
    userId: req.body.studentId,
    correctedArray: req.body.correctedQuestionArray,
    time: req.body.timeDuration
  }
  
  const task = await Task.findById(taskId);

  task.scoreHistory.push(scoreHistory)

  Task.where({ _id: taskId}).updateOne({ scoreHistory: task.scoreHistory }).exec()

  // Get lgroups for this user   
  const allLgroups = await Lgroup.find()
  
  const lgroups = allLgroups.filter(group=> (group.members).indexOf(req.user._id)>-1)
  
  if (!lgroups) return res.status(404).send('You do not have any learning group');

  // to retreive the array of taskIds from the groups
  let arrayOfTaskId = []
  lgroups.map(x=> x.task.map(y=> arrayOfTaskId.push(y)))

  // to retrieve the tasks using their respective taskid from the above array
  let TTTasks = []
  for (i = 0; i < arrayOfTaskId.length; i++){
    TTTasks.push(await Task.findById(arrayOfTaskId[i]))
  }
  
if (!TTTasks) return res.status(404).send('The task with the given ID was not found.');

res.send(TTTasks);

})


function buildOptionToTask (task) {

  let answerArray = []

  task.questions.map(question=> answerArray.push(Object.values(question)[1]))
  
  for (let i=0 ; i<task.questions.length; i++){
      let question = task.questions[i]
          let answerArrayOptions = answerArray.filter(x => x !== question.answerImageName)

          answerArrayOptions = selectElementFromArray(3, answerArrayOptions)

          answerArrayOptions = [ ...answerArrayOptions, question.answerImageName]

          question["ArrayOptions"] = onShuffleArray(answerArrayOptions)

          task.questions[i] = question
  }

  Task.where({ _id: task._id}).updateOne({ questions: task.questions }).exec()

  return task

}

// Randomly select EvaluationTime of EvaluatorArray
function selectElementFromArray(nToSelect, ARray){
  let selectedElmentArray = [];
  
  // Shurfle an array
//   shuffle(ARray)
  
 // get first nToSelect elements
  for (let i=0; i<nToSelect; i++){
    selectedElmentArray.push(ARray[i])
  }
  return selectedElmentArray
}

function onShuffleArray(array){
  let counter = array.length;

  // While there are elements in the array
  while (counter > 0) {
      // Pick a random index
      let index = Math.floor(Math.random() * counter);

      // Decrease counter by 1
      counter--;

      // And swap the last element with it
      let temp = array[counter];
      array[counter] = array[index];
      array[index] = temp;
  }
  return array;
}

function getUsersFromTaskAnswerHistory(taskAnswer){
  let FinalArray =[]
          for (let i=0; i<taskAnswer.length; i++){
          FinalArray.push(Object.keys(taskAnswer[i])[0])
              }
  return FinalArray
    
  }

module.exports = router; 