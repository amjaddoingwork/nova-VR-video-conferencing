const express = require('express');
const router = express.Router();
const { User } = require('../models');

// Update onboarding status
router.post('/status', async (req, res) => {
  try {
    const { step, completed } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.onboarding) {
      user.onboarding = {};
    }

    user.onboarding[step] = completed;
    await user.save();

    res.json(user.onboarding);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get onboarding status
router.get('/status', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.onboarding || {});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 