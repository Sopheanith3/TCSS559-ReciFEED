const express = require('express');
const router = express.Router();
const {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  addReview,
  deleteReview
} = require('../controllers/recipeController');

// Recipe routes
router.get('/', getAllRecipes);
router.get('/:id', getRecipeById);
router.post('/', createRecipe);
router.put('/:id', updateRecipe);
router.delete('/:id', deleteRecipe);

// Review routes
router.post('/:id/reviews', addReview);
router.delete('/:id/reviews/:reviewId', deleteReview);

module.exports = router;
