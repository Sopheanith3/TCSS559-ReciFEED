const express = require('express');
const router = express.Router();
const { upload } = require('../utils/upload');
const {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  addReview,
  deleteReview,
  getFilterOptions,
  filterRecipes
} = require('../controllers/recipeController');

// Filter routes (must come before /:id routes)
router.get('/filters/options', getFilterOptions);
router.get('/filter', filterRecipes);

// Recipe routes
router.get('/', getAllRecipes);
router.get('/:id', getRecipeById);
router.post('/', upload.array('images', 5), createRecipe);
router.put('/:id', upload.array('images', 5), updateRecipe);
router.delete('/:id', deleteRecipe);

// Review routes
router.post('/:id/reviews', addReview);
router.delete('/:id/reviews/:reviewId', deleteReview);

module.exports = router;
