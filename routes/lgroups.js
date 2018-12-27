const {Lgroup, validate} = require('../models/lgroup'); 
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const lgroups = await Lgroup.find().sort('name');
  res.send(lgroups);
});

//creating a learning group

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let lgroup = new Lgroup({ 
    author: user._id,
    groupname: req.body.groupname,
    code: 'codegenerator',
    member: [], // this should be userId
    tasks: [], // array of taskIds
  });
  lgroup = await lgroup.save();
  
  res.send(lgroup);
});

// Updating task to a Lgroup

router.put('/:id', async (req, res) => {
    const { error } = validate(req.body); 
    if (error) return res.status(400).send(error.details[0].message);
  
    const lgroup = await Lgroup.findByIdAndUpdate(req.params.id,
      { 
        member: [], // this should be userId
        tasks: [], // array of taskIds
      }, { new: true });
  
    if (!lgroup) return res.status(404).send('The task with the given ID was not found.');
    
    res.send(lgroup);
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

module.exports = router; 