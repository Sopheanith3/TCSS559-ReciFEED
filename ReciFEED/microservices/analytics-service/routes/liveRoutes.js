/**
 * Routes for getting live (~10 seconds) analytics information
 */
const express = require('express');
const Event = require('../models/event');

const router = express.Router();

const getMinuteAgo = () => {
  return new Date(Date.now() - 60 * 1000);
}

const getTenSecondAgo = () => {
  return new Date(Date.now() - 10 * 1000);
}

const types = [
  'post-interactions',
  'recipe-views',
  'users'
];

router.get('/', (req, res) => {
  const { type } = req.query;
  if (!type) {
    return res.status(400).json({ error: "Must provide the 'type' query value." });
  }

  if (!types.includes(type)) {
    return res.status(400).json({ 
      error: `The 'type' query must have any value ${types.toString()}.`
    });
  }

  let number = 0;

  switch (type) {
    case 'post-interactions':
      const postInteractions = Event.find({ 
        type: 'post_interaction', 
        timestamp: { $gte: getTenSecondAgo() }
      });
      if (!postInteractions) break;
      number = postInteractions.length;
      break;
    case 'recipe-views':
      const recipeViews = Event.find({ 
        type: 'post_interaction', 
        timestamp: { $gte: getTenSecondAgo() }
      });
      number = recipeViews.length;
      break;
    case '':
  }

  
});



// GET /live type=post-interactions/recipe-views/users

// Live Users
// SEE BELOW
// Live Recipe Views
// Recipe View Event { userId, recipeId, datetime }
// Live Post Interactions
// Post Interaction Event { userId, postId, datetime }

module.exports = router;