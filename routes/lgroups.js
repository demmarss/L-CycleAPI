const {Lgroup, validate} = require('../models/lgroup'); 
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const shortid = require ('shortid')

router.get('/', auth, async (req, res) => {
  console.log(req.user)
  const lgroups = await Lgroup.find().sort('name');
  res.send(lgroups);
});

//creating a learning group
router.post('/', auth, async (req, res) => {
  
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let lgroup = new Lgroup({ 
    authorId: req.user._id,
    lgtitle: req.body.lgtitle,
    code: shortid.generate(),
    members: [req.user._id], // this should be userId
    tasks: [], // array of taskIds
  });
  lgroup = await lgroup.save();
  res.send(lgroup);
});



// Joining a Lgroup
router.put('/:lgCode', auth, async (req, res) => {
    const { error } = validate(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    var query = { code: req.params.lgCode };

    const lgroup = await Lgroup.findOne(query)
    
    const memberId = lgroup.members.find(memberId=> memberId === req.user._id) 
    
    if (memberId){ 
      
      let query2 = { authorId: req.user._id};
      const lgroupsAsAuthor = await Lgroup.find(query2)
      
      const allLgroups = await Lgroup.find()
    
      const lgroupsAsMember = allLgroups.filter(group=> (group.members).indexOf(req.user._id)>-1)
    
      const lgroups = merge_array(lgroupsAsMember, lgroupsAsAuthor)
    
      if (!lgroups) return res.status(404).send('You do not have any learning group');
      
      return res.send(lgroups)
    }

    lgroup.members.push(req.user._id)

    Lgroup.where({ _id: lgroup._id }).updateOne({ members:  lgroup.members }).exec()
  
    if (!lgroup) return res.status(404).send('The task with the given code was not found.');

    let query2 = { authorId: req.user._id};
    const lgroupsAsAuthor = await Lgroup.find(query2)
    
    const allLgroups = await Lgroup.find()
  
    const lgroupsAsMember = allLgroups.filter(group=> (group.members).indexOf(req.user._id)>-1)
  
    const lgroups = merge_array(lgroupsAsMember, lgroupsAsAuthor)
  
    if (!lgroups) return res.status(404).send('You do not have any learning group');
    
    res.send(lgroups);
  });


// Getting the list of lgroups for the user
router.get('/:userId', auth, async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let query = { authorId: req.user._id};
  const lgroupsAsAuthor = await Lgroup.find(query)
  
  const allLgroups = await Lgroup.find()

  const lgroupsAsMember = allLgroups.filter(group=> (group.members).indexOf(req.params.userId)>-1)

  const lgroups = merge_array(lgroupsAsMember, lgroupsAsAuthor)

  if (!lgroups) return res.status(404).send('You do not have any learning group');
  
  res.send(lgroups);
});
   

// deleting a learning group

router.delete('/:id', async (req, res) => {
  const lgroup = await Lgroup.findByIdAndRemove(req.params.id);

  if (!lgroup) return res.status(404).send('The task with the given ID was not found.');

  res.send(lgroup);
});

router.get('/:id', async (req, res) => {
  const lgroup = await Lgroup.findById(req.params.id);

  if (!lgroup) return res.status(404).send('The task with the given ID was not found.');

  res.send(lgroup);
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