const Post = require('../models/post');
const Recipe = require('../models/recipe');
const User = require('../models/user');
const Search = require('../models/search');
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
  const tags = req.query.tags ? req.query.tags.split(',').map(t => t.trim()) : null;
  const cookingTime = req.query.cookingTime;

  // Build search criteria
  let searchCriteria = [];

  // Add text search if query provided
  if (query) {
    const searchRegex = new RegExp(query, 'i');
    searchCriteria.push({
      $or: [
        { title: searchRegex },
        { tags: searchRegex },
        { ingredients: searchRegex }
      ]
    });
  }

  // Add tag filter if tags provided
  if (tags && tags.length > 0) {
    searchCriteria.push({
      tags: { $in: tags.map(tag => new RegExp(tag, 'i')) }
    });
  }

  // Add cooking time filter if provided
  if (cookingTime) {
    const timeRegex = /(\d+)/;
    
    if (cookingTime === '0-15') {
      // Match recipes with cooking time less than 15 minutes
      searchCriteria.push({
        cooking_time: { $regex: /^([0-9]|1[0-4])\s*(min|mins|minute|minutes)/i }
      });
    } else if (cookingTime === '15-30') {
      searchCriteria.push({
        cooking_time: { $regex: /(1[5-9]|2[0-9]|30)\s*(min|mins|minute|minutes)/i }
      });
    } else if (cookingTime === '30-45') {
      searchCriteria.push({
        cooking_time: { $regex: /(3[0-9]|4[0-5])\s*(min|mins|minute|minutes)/i }
      });
    } else if (cookingTime === '45-60') {
      searchCriteria.push({
        cooking_time: { $regex: /(4[5-9]|5[0-9]|60)\s*(min|mins|minute|minutes)/i }
      });
    } else if (cookingTime === '60+') {
      searchCriteria.push({
        cooking_time: { $regex: /([6-9][0-9]|[1-9][0-9]{2,})\s*(min|mins|minute|minutes)/i }
      });
    }
  }

  // If no criteria, return all recipes
  const finalCriteria = searchCriteria.length > 0 ? { $and: searchCriteria } : {};

  const recipes = await Recipe.find(finalCriteria).limit(50);

  res.status(200).json({
    status: 'success',
    query: query || 'filtered',
    filters: {
      tags: tags || [],
      cookingTime: cookingTime || null
    },
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
