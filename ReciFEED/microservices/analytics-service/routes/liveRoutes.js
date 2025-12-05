/**
 * Routes for getting live (very recent) analytics information
 */
const express = require('express');
const Event = require('../models/event');

const router = express.Router();

const types = [
  'post-interactions',
  'recipe-views',
  'users'
];

/**
 * GET /live?type=[type]
 */
router.get('/', async (req, res) => {
  const { type } = req.query;
  if (!type) {
    return res.status(400).json({ error: "Must provide the 'type' query value." });
  }

  if (!types.includes(type)) {
    return res.status(400).json({ 
      error: `The 'type' query must have any value ${types.toString()}.`
    });
  }

  let count = 0;

  try {
    switch (type) {
      case 'post-interactions':
        count = await Event.countDocuments({ 
          type: 'post_interaction', 
          timestamp: { $gte: new Date(Date.now() - 3 * 1000) }
        });
        break;
      case 'recipe-views':
        count = await Event.countDocuments({ 
          type: 'recipe_view', 
          timestamp: { $gte: new Date(Date.now() - 3 * 1000) }
        });
        break;
      case 'users':
        const users = await Event.distinct(
          "user_id", 
          // Uses 30s as an assumption that users may not interact actively
          // but still be viewing content for this period
          { timestamp: { $gte: new Date(Date.now() - 30 * 1000) } }
        );
        count = users.length;
        break;
    }

    return res.status(200).json({ count })
  } catch (error) {
    return res.status(500).json({ error: 'Could not retrieve analytics.' })
  }
});

module.exports = router;