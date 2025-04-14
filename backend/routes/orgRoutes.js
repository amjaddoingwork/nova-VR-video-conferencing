const express = require('express');
const router = express.Router();
const { Organization } = require('../models');

// Create a new organization
router.post('/', async (req, res) => {
  try {
    const { name, description, ownerId } = req.body;
    
    const org = new Organization({
      name,
      description,
      owner: ownerId,
      members: [ownerId]
    });

    await org.save();
    res.json(org);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all organizations for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const orgs = await Organization.find({
      members: req.params.userId
    }).populate('owner', 'name email');
    res.json(orgs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Add member to organization
router.post('/:orgId/members', async (req, res) => {
  try {
    const { userId } = req.body;
    const org = await Organization.findById(req.params.orgId);
    
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    if (!org.members.includes(userId)) {
      org.members.push(userId);
      await org.save();
    }

    res.json(org);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 