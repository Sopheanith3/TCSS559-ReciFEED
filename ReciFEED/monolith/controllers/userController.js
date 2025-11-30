const User = require('../models/user');
const { ErrorResponse, asyncHandler } = require('../utils/errorHandler');

const getAllUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const users = await User.find()
    .select('-password_hash') // Exclude password from response
    .sort({ created_at: -1 })
    .limit(limit)
    .skip(skip);

  const total = await User.countDocuments();

  res.status(200).json({
    status: 'success',
    data: {
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasMore: page < Math.ceil(total / limit)
      }
    }
  });
});

const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password_hash');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: user
  });
});

const createUser = asyncHandler(async (req, res, next) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return next(new ErrorResponse('Please provide email, password, and username', 400));
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse('User with this email already exists', 400));
  }

  const userData = {
    email,
    password_hash: password, // In production, hash this with bcrypt
    username,
    created_at: new Date()
  };

  const user = await User.create(userData);

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password_hash;

  res.status(201).json({
    status: 'success',
    data: userResponse
  });
});

const updateUser = asyncHandler(async (req, res, next) => {
  const { email, username } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Update fields
  if (email) user.email = email;
  if (username) user.username = username;

  await user.save();

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password_hash;

  res.status(200).json({
    status: 'success',
    message: 'User updated successfully',
    data: userResponse
  });
});

const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  await user.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'User successfully deleted',
    data: {
      userId: req.params.id
    }
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
