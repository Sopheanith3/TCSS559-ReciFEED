const express = require('express');
const router = express.Router();
const {
  searchAll,
  searchRecipes,
  searchUsers,
  searchPosts,
} = require('../controllers/searchController');

// Search routes
router.get('/', searchAll);
router.get('/recipes', searchRecipes);
router.get('/users', searchUsers);
router.get('/posts', searchPosts);

module.exports = router;
