// GET /popular/posts/day type=post-interactions/recipe-views/users range=day/week/month

// Popular Posts
// ^ PI by postId for time
// Popular Users
// User View Event { userId, viewedUserId, datetime }
// Popular Recipes
// ^ RV by recipeId for time
// Popular Recipe Search Filters
// Search Event { userId, text, filters, datetime }
// Popular Search Terms
// ^ SE

/**
 * Routes for getting live (~10 seconds) analytics information
 */
const express = require('express');
const Event = require('../models/event');

const router = express.Router();

const getDayAgo = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date;
}

const getWeekAgo = () => {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date;
}

const getMonthAgo = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date;
}

const types = [
  'post-interactions',
  'recipe-views',
  'users'
];

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
          timestamp: { $gte: getTenSecondAgo() }
        });
        break;
      case 'recipe-views':
        count = await Event.countDocuments({ 
          type: 'recipe_view', 
          timestamp: { $gte: getTenSecondAgo() }
        });
        break;
      case 'users':
        const [{ user_count }] = await Event.aggregate([
          { $match: { timestamp: { $gte: getMinuteAgo() } } },
          { $group: { _id: "$userId" } },
          { $count: "user_count" }
        ]);
        number = user_count || 0;
        break;
    }

    return res.status(200).json({ count })
  } catch (error) {
    return res.status(500).json({ error: 'Could not retrieve analytics.' })
  }
});

module.exports = router;