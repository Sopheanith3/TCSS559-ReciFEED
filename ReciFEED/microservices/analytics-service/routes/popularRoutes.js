/**
 * Routes for getting aggregate popularity analytics
 */
const express = require('express');
const Event = require('../models/event');

const router = express.Router();

const types = [
  'posts',
  'recipes',
  'users',
  'search'
];

const ranges = [
  'day',
  'week',
  'month'
];

const getTimeFrame = (range) => {
  const date = new Date();
  switch (range) {
    case 'day':
      date.setDate(date.getDate() - 1);
      break;
    case 'week':
      date.setDate(date.getDate() - 7);
      break;
    case 'month':
      date.setMonth(date.getMonth() - 1);
      break;
  }
  return date;
}

const getPopularCount = async (timeframe, type) => {
  const results = await Event.aggregate([
    { $match: { type, timestamp: { $gte: timeframe } } },
    { $group: { id: "$content.id", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    { // Rename fields
      $project: {
        contentId: "$_id",
        interactions: "$count",
        _id: 0
      }
    }
  ]);

  return results;
}

const getPopularSearchTerms = async (timeframe) => {
  const searches = await Event.find({ 
    type: 'search', timestamp: { $gte: timeframe } 
  });

  // Combine all text into one big string
  const allText = searches
    .map(s => s.content?.text || "")
    .join(" ");

  // Normalize + split into words
  const words = allText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // remove punctuation
    .split(/\s+/)
    .filter(Boolean); // remove empty strings

  // Count occurrences
  const freq = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }

  // Convert to array + sort by most frequent
  const popular = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .map(([term, count]) => ({ term, count }));

  return popular.slice(0, 5);
}

/**
 * GET /popular?type=[type]&range=[time]
 */
router.get('/', async (req, res) => {
  const { type, range } = req.query;
  if (!type || !range) {
    return res.status(400).json({ error: "Must provide the 'type' and 'range' query values." });
  }

  if (!types.includes(type)) {
    return res.status(400).json({ 
      error: `The 'type' query must have any value ${types.toString()}.`
    });
  }

  if (!ranges.includes(range)) {
    return res.status(400).json({ 
      error: `The 'range' query must have any value ${ranges.toString()}.`
    });
  }

  let results;

  try {
    switch (type) {
      case 'posts':
        results = getPopularCount(getTimeFrame(), 'post_interaction');
        break;
      case 'recipes':
        results = getPopularRecipes(getTimeFrame(), 'recipe_view');
        break;
      case 'users':
        results = getPopularUsers(getTimeFrame(), 'user_view');
        break;
      case 'search':
        results = getPopularSearchTerms(getTimeFrame());
    }

    return res.status(200).json({ results })
  } catch (error) {
    return res.status(500).json({ error: 'Could not retrieve analytics.' })
  }
});

module.exports = router;