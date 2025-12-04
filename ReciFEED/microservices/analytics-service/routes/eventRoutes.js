/**
 * Routes for posting an event to analytics
 */
const express = require('express');
const Event = require('../models/event');

const router = express.Router();

const eventTypes = [
  'login',
  'create_post',
  'create_recipe',
  'recipe_view',
  'post_interaction',
  'user_view',
  'search'
];

// Helper to validate content
function validateContent(type, content) {
  switch (type) {
    case 'search':
      if (!content?.text || !content?.tags) {
        return "Search text and tags required in content.";
      }
      break;

    case 'login':
    case 'create_post':
    case 'create_recipe':
      // No content, currently only logs of user activity
      break;

    default:
      if (!content?.id) {
        return "Content ID required.";
      }
      break;
  }
  return null;
}

/**
 * POST /event
 * Post an event to the analytics service
 */
router.post('/event', validateToken, async (req, res) => {
  const { id } = req.user;
  const { type, content } = req.body;
  if (!type || !eventTypes.includes(type)) {
    return res.status(400).json({ 
      error: `Must have a valid event type: ${eventTypes.toString()}` 
    });
  }

  // Validate content fields
  const contentError = validateContent(type, content)
  if (contentError) {
    return res.status(400).json({ error: contentError });
  }

  try {
    const event = await Event.create({
      type,
      userId: id,
      timestamp: new Date(),
      content
    });
    return res.status(201).json({ message: 'Event logged successfully.', data: event});
  } catch (error) {
    return res.status(500).json({ error: 'Internal error, could not log event.' });
  }
});

module.exports = router;