const express = require('express');
const router = express.Router();
const {
  searchAll,
  searchRecipes,
  searchUsers,
  searchPosts,
  saveSearch
} = require('../controllers/searchController');

// Search routes
router.get('/', searchAll);
router.get('/recipes', searchRecipes);
router.get('/users', searchUsers);
router.get('/posts', searchPosts);
router.post('/save', saveSearch);

module.exports = router;
