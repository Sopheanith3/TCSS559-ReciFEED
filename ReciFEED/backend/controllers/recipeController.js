const Recipe = require('../database/models/recipe');
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

const likeRecipe = asyncHandler(async (req, res, next) => {
  const { userId, username } = req.body;

  if (!userId) {
    return next(new ErrorResponse('Please provide userId', 400));
  }

  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    return next(new ErrorResponse('Recipe not found', 404));
  }

  // Check if already liked
  const alreadyLiked = recipe.likes.some(
    like => like.user_id.toString() === userId
  );

  if (alreadyLiked) {
    return next(new ErrorResponse('Recipe already liked', 400));
  }

  // Add like
  recipe.likes.push({
    user_id: userId,
    username: username || 'Anonymous',
    created_at: new Date()
  });

  await recipe.save();

  res.status(200).json({
    status: 'success',
    message: 'Recipe liked successfully',
    data: {
      recipeId: recipe._id,
      totalLikes: recipe.likes.length
    }
  });
});

const unlikeRecipe = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return next(new ErrorResponse('Please provide userId', 400));
  }

  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    return next(new ErrorResponse('Recipe not found', 404));
  }

  // Remove like
  const initialLength = recipe.likes.length;
  recipe.likes = recipe.likes.filter(
    like => like.user_id.toString() !== userId
  );

  if (recipe.likes.length === initialLength) {
    return next(new ErrorResponse('Recipe was not liked by this user', 400));
  }

  await recipe.save();

  res.status(200).json({
    status: 'success',
    message: 'Recipe unliked successfully',
    data: {
      recipeId: recipe._id,
      totalLikes: recipe.likes.length
    }
  });
});

const addComment = asyncHandler(async (req, res, next) => {
  const { content, userId, username } = req.body;

  if (!content) {
    return next(new ErrorResponse('Please provide comment content', 400));
  }

  if (!userId) {
    return next(new ErrorResponse('Please provide userId', 400));
  }

  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    return next(new ErrorResponse('Recipe not found', 404));
  }

  const comment = {
    user_id: userId,
    username: username || 'Anonymous',
    text: content,
    created_at: new Date()
  };

  recipe.comments.push(comment);
  await recipe.save();

  const newComment = recipe.comments[recipe.comments.length - 1];

  res.status(201).json({
    status: 'success',
    data: newComment
  });
});

const deleteComment = asyncHandler(async (req, res, next) => {
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    return next(new ErrorResponse('Recipe not found', 404));
  }

  const comment = recipe.comments.id(req.params.commentId);

  if (!comment) {
    return next(new ErrorResponse('Comment not found', 404));
  }

  comment.deleteOne();
  await recipe.save();

  res.status(200).json({
    status: 'success',
    message: 'Comment successfully deleted',
    data: {
      commentId: req.params.commentId
    }
  });
});

module.exports = {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  likeRecipe,
  unlikeRecipe,
  addComment,
  deleteComment
};
