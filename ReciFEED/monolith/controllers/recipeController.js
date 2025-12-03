const Recipe = require('../models/recipe');
const { ErrorResponse, asyncHandler } = require('../utils/errorHandler');

const getAllRecipes = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const sortBy = req.query.sortBy || 'created_at';
  const order = req.query.order === 'asc' ? 1 : -1;
  
  const skip = (page - 1) * limit;

  const sort = {};
  sort[sortBy] = order;

  const recipes = await Recipe.find()
    .sort(sort)
    .limit(limit)
    .skip(skip);

  const total = await Recipe.countDocuments();

  res.status(200).json({
    status: 'success',
    data: {
      recipes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecipes: total,
        hasMore: page < Math.ceil(total / limit)
      }
    }
  });
});

const getRecipeById = asyncHandler(async (req, res, next) => {
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    return next(new ErrorResponse('Recipe not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: recipe
  });
});

const createRecipe = asyncHandler(async (req, res, next) => {
  const { title, tags, ingredients, instructions, images, userId } = req.body;

  if (!title || !userId) {
    return next(new ErrorResponse('Please provide title and userId', 400));
  }

  const recipeData = {
    user_id: userId,
    title,
    tags: tags || [],
    ingredients: ingredients || [],
    instructions: instructions || [],
    image_urls: images || [],
    created_at: new Date()
  };

  const recipe = await Recipe.create(recipeData);

  res.status(201).json({
    status: 'success',
    data: recipe
  });
});

const updateRecipe = asyncHandler(async (req, res, next) => {
  const { title, tags, ingredients, instructions, images } = req.body;

  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    return next(new ErrorResponse('Recipe not found', 404));
  }

  // Update fields
  if (title) recipe.title = title;
  if (tags) recipe.tags = tags;
  if (ingredients) recipe.ingredients = ingredients;
  if (instructions) recipe.instructions = instructions;
  if (images) recipe.image_urls = images;

  await recipe.save();

  res.status(200).json({
    status: 'success',
    message: 'Recipe updated successfully',
    data: recipe
  });
});

const deleteRecipe = asyncHandler(async (req, res, next) => {
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    return next(new ErrorResponse('Recipe not found', 404));
  }

  await recipe.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'Recipe successfully deleted',
    data: {
      recipeId: req.params.id
    }
  });
});

const addReview = asyncHandler(async (req, res, next) => {
  const { rating, comment, userId, username } = req.body;

  if (!rating || !comment) {
    return next(new ErrorResponse('Please provide rating and comment', 400));
  }

  if (rating < 1 || rating > 5) {
    return next(new ErrorResponse('Rating must be between 1 and 5', 400));
  }

  if (!userId) {
    return next(new ErrorResponse('Please provide userId', 400));
  }

  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    return next(new ErrorResponse('Recipe not found', 404));
  }

  // Check if user already reviewed
  const alreadyReviewed = recipe.reviews.some(
    review => review.user_id.toString() === userId
  );

  if (alreadyReviewed) {
    return next(new ErrorResponse('You have already reviewed this recipe', 400));
  }

  // Add review
  const review = {
    user_id: userId,
    username: username || 'Anonymous',
    rating: Number(rating),
    comment,
    created_at: new Date()
  };

  recipe.reviews.push(review);
  await recipe.save();

  const newReview = recipe.reviews[recipe.reviews.length - 1];

  // Calculate average rating
  const avgRating = recipe.reviews.reduce((acc, r) => acc + r.rating, 0) / recipe.reviews.length;

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
      totalReviews: recipe.reviews.length,
      averageRating: Math.round(avgRating * 10) / 10
    }
  });
});

const deleteReview = asyncHandler(async (req, res, next) => {
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    return next(new ErrorResponse('Recipe not found', 404));
  }

  const review = recipe.reviews.id(req.params.reviewId);

  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }

  review.deleteOne();
  await recipe.save();

  // Calculate average rating
  const avgRating = recipe.reviews.length > 0 
    ? recipe.reviews.reduce((acc, r) => acc + r.rating, 0) / recipe.reviews.length 
    : 0;

  res.status(200).json({
    status: 'success',
    message: 'Review successfully deleted',
    data: {
      reviewId: req.params.reviewId,
      totalReviews: recipe.reviews.length,
      averageRating: Math.round(avgRating * 10) / 10
    }
  });
});

module.exports = {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  addReview,
  deleteReview
};
