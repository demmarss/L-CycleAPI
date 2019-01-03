const {Task, validate} = require('../models/task');
const {Lgroup} = require('../models/lgroup'); 
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const tasks = await Task.find().sort('name');
  res.send(tasks);
});

router.post('/', auth, async (req, res) => { 
  const { error } = validate(req.body.task); 
  if (error) return res.status(400).send(error.details[0].message);

  let task = new Task({ 
    topic: req.body.task.topic,
    user: req.user._id, // this should be userId
    questions: req.body.task.questions,
    scoreHistory: req.body.task.scoreHistory,
  });

  task = await task.save();

    const lgroup = await Lgroup.findById(req.body.lgroupId)

    lgroup.task.push(task._id)

    Lgroup.where({ _id: lgroup._id }).updateOne({ task:  lgroup.task }).exec()

    // Get lgroups for this user
    let query = { authorId: req.user._id};
    const lgroupsAsAuthor = await Lgroup.find(query)
    
    const allLgroups = await Lgroup.find()
  
    const lgroupsAsMember = allLgroups.filter(group=> (group.members).indexOf(req.params.userId)>-1)
  
    const lgroups = merge_array(lgroupsAsMember, lgroupsAsAuthor)
  
    if (!lgroups) return res.status(404).send('You do not have any learning group');
        
  res.send({task, lgroups});
});

router.delete('/:id', async (req, res) => {
  const task = await Task.findByIdAndRemove(req.params.id);

  if (!task) return res.status(404).send('The task with the given ID was not found.');

  res.send(task);
});

//To retrieve all the tasks for a particle user
router.get('/:userId', auth, async (req, res) => {

  // Get lgroups for this user
  let query = { authorId: req.user._id};
    const lgroupsAsAuthor = await Lgroup.find(query)
    
    const allLgroups = await Lgroup.find()
  
    const lgroupsAsMember = allLgroups.filter(group=> (group.members).indexOf(req.params.userId)>-1)
  
    const lgroups = merge_array(lgroupsAsMember, lgroupsAsAuthor)
  
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
});



router.get('/:id', async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) return res.status(404).send('The task with the given ID was not found.');

  res.send(task);
});



function merge_array(array1, array2) {
  const result_array = [];
  const arr = array1.concat(array2);
  let len = arr.length;
  const assoc = {};

  while(len--) {
      const item = arr[len];

      if(!assoc[item]) 
      { 
          result_array.unshift(item);
          assoc[item] = true;
      }
  }

  return result_array;
}

module.exports = router; 