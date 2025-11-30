const Post = require('../database/models/post');
const Recipe = require('../database/models/recipe');
const User = require('../database/models/user');
const Search = require('../database/models/search');
const { ErrorResponse, asyncHandler } = require('../utils/errorHandler');

const searchAll = asyncHandler(async (req, res, next) => {
  const query = req.query.q;

  if (!query) {
    return next(new ErrorResponse('Please provide a search query', 400));
  }

  const searchRegex = new RegExp(query, 'i'); // Case-insensitive search

  // Search recipes by title, tags, or ingredients
  const recipes = await Recipe.find({
    $or: [
      { title: searchRegex },
      { tags: searchRegex },
      { ingredients: searchRegex }
    ]
  }).limit(10);

  // Search users by username or email
  const users = await User.find({
    $or: [
      { username: searchRegex },
      { email: searchRegex }
    ]
  }).select('-password_hash').limit(10);

  // Search posts by body content
  const posts = await Post.find({
    body: searchRegex
  }).limit(10);

  res.status(200).json({
    status: 'success',
    query,
    data: {
      recipes,
      users,
      posts,
      totalResults: recipes.length + users.length + posts.length
    }
  });
});

const searchRecipes = asyncHandler(async (req, res, next) => {
  const query = req.query.q;
  const tags = req.query.tags ? req.query.tags.split(',') : null;

  if (!query && !tags) {
    return next(new ErrorResponse('Please provide a search query or tags', 400));
  }

  const searchRegex = query ? new RegExp(query, 'i') : null;

  let searchCriteria = {};

  if (searchRegex && tags) {
    searchCriteria = {
      $and: [
        {
          $or: [
            { title: searchRegex },
            { tags: searchRegex },
            { ingredients: searchRegex }
          ]
        },
        { tags: { $in: tags } }
      ]
    };
  } else if (searchRegex) {
    searchCriteria = {
      $or: [
        { title: searchRegex },
        { tags: searchRegex },
        { ingredients: searchRegex }
      ]
    };
  } else if (tags) {
    searchCriteria = { tags: { $in: tags } };
  }

  const recipes = await Recipe.find(searchCriteria).limit(50);

  res.status(200).json({
    status: 'success',
    query: query || 'tag filter',
    filters: tags || [],
    data: {
      recipes,
      totalResults: recipes.length
    }
  });
});

const searchUsers = asyncHandler(async (req, res, next) => {
  const query = req.query.q;

  if (!query) {
    return next(new ErrorResponse('Please provide a search query', 400));
  }

  const searchRegex = new RegExp(query, 'i');

  const users = await User.find({
    $or: [
      { username: searchRegex },
      { email: searchRegex }
    ]
  }).select('-password_hash').limit(50);

  res.status(200).json({
    status: 'success',
    query,
    data: {
      users,
      totalResults: users.length
    }
  });
});

const searchPosts = asyncHandler(async (req, res, next) => {
  const query = req.query.q;

  if (!query) {
    return next(new ErrorResponse('Please provide a search query', 400));
  }

  const searchRegex = new RegExp(query, 'i');

  const posts = await Post.find({
    body: searchRegex
  }).limit(50);

  res.status(200).json({
    status: 'success',
    query,
    data: {
      posts,
      totalResults: posts.length
    }
  });
});

const saveSearch = asyncHandler(async (req, res, next) => {
  const { query, filters } = req.body;

  if (!query) {
    return next(new ErrorResponse('Please provide a search query', 400));
  }

  const searchData = {
    query,
    filters: filters || [],
    created_at: new Date()
  };

  const search = await Search.create(searchData);

  res.status(201).json({
    status: 'success',
    message: 'Search saved successfully',
    data: search
  });
});

module.exports = {
  searchAll,
  searchRecipes,
  searchUsers,
  searchPosts,
  saveSearch
};
