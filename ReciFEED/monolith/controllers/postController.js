const Post = require('../models/post');
const User = require('../models/user');
const { ErrorResponse, asyncHandler } = require('../utils/errorHandler');

const createPost = asyncHandler(async (req, res, next) => {
  const { content, images, recipe_id, userId, username } = req.body;

  if (!content) {
    return next(new ErrorResponse('Please provide post content', 400));
  }

  if (!userId) {
    return next(new ErrorResponse('Please provide userId', 400));
  }

  const postData = {
    user_id: userId,
    username: username || 'Anonymous',
    body: content,
    image_urls: images || [],
    recipe_id: recipe_id || '000000000000000000000000',
    created_at: new Date()
  };

  const post = await Post.create(postData);

  res.status(201).json({
    status: 'success',
    data: post
  });
});

const getFeed = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const sortBy = req.query.sortBy || 'created_at';
  const order = req.query.order === 'asc' ? 1 : -1;
  
  const skip = (page - 1) * limit;

  const sort = {};
  sort[sortBy] = order;

  const posts = await Post.find()
    .sort(sort)
    .limit(limit)
    .skip(skip);

  // Populate current usernames for posts, likes, and comments
  const userIds = new Set();
  posts.forEach(post => {
    userIds.add(post.user_id.toString());
    post.likes.forEach(like => userIds.add(like.user_id.toString()));
    post.comments.forEach(comment => userIds.add(comment.user_id.toString()));
  });

  // Fetch all users at once
  const users = await User.find({ _id: { $in: Array.from(userIds) } }).select('username');
  const userMap = new Map(users.map(u => [u._id.toString(), u.username]));

  // Update posts with current usernames
  const updatedPosts = posts.map(post => {
    const postObj = post.toObject();
    postObj.username = userMap.get(post.user_id.toString()) || postObj.username || 'Anonymous';
    
    // Update likes usernames
    postObj.likes = postObj.likes.map(like => ({
      ...like,
      username: userMap.get(like.user_id.toString()) || like.username || 'Anonymous'
    }));
    
    // Update comments usernames
    postObj.comments = postObj.comments.map(comment => ({
      ...comment,
      username: userMap.get(comment.user_id.toString()) || comment.username || 'Anonymous'
    }));
    
    return postObj;
  });

  const total = await Post.countDocuments();

  res.status(200).json({
    status: 'success',
    data: {
      posts: updatedPosts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasMore: page < Math.ceil(total / limit)
      }
    }
  });
});

const getPostById = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: post
  });
});

const getPostsByUser = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const posts = await Post.find({ user_id: req.params.userId })
    .sort({ created_at: -1 })
    .limit(limit)
    .skip(skip);

  const total = await Post.countDocuments({ user_id: req.params.userId });

  res.status(200).json({
    status: 'success',
    data: {
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total
      }
    }
  });
});

const updatePost = asyncHandler(async (req, res, next) => {
  const { content, images } = req.body;

  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  // Update fields if provided
  if (content !== undefined) {
    post.body = content;
  }
  if (images !== undefined) {
    post.image_urls = images;
  }

  await post.save();

  res.status(200).json({
    status: 'success',
    message: 'Post successfully updated',
    data: post
  });
});

const deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  await post.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'Post successfully deleted',
    data: {
      postId: req.params.id
    }
  });
});

const likePost = asyncHandler(async (req, res, next) => {
  const { userId, username } = req.body;

  if (!userId) {
    return next(new ErrorResponse('Please provide userId', 400));
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  // Check if already liked
  const alreadyLiked = post.likes.some(
    like => like.user_id.toString() === userId
  );

  if (alreadyLiked) {
    return next(new ErrorResponse('Post already liked', 400));
  }

  // Add like
  post.likes.push({
    user_id: userId,
    username: username || 'Anonymous',
    created_at: new Date()
  });

  await post.save();

  res.status(200).json({
    status: 'success',
    message: 'Post liked successfully',
    data: {
      postId: post._id,
      totalLikes: post.likes.length
    }
  });
});

const unlikePost = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return next(new ErrorResponse('Please provide userId', 400));
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  // Remove like
  const initialLength = post.likes.length;
  post.likes = post.likes.filter(
    like => like.user_id.toString() !== userId
  );

  if (post.likes.length === initialLength) {
    return next(new ErrorResponse('Post was not liked by this user', 400));
  }

  await post.save();

  res.status(200).json({
    status: 'success',
    message: 'Post unliked successfully',
    data: {
      postId: post._id,
      totalLikes: post.likes.length
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

  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  const comment = {
    user_id: userId,
    username: username || 'Anonymous',
    text: content,
    created_at: new Date()
  };

  post.comments.push(comment);
  await post.save();

  const newComment = post.comments[post.comments.length - 1];

  res.status(201).json({
    status: 'success',
    data: newComment
  });
});

const deleteComment = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  const comment = post.comments.id(req.params.commentId);

  if (!comment) {
    return next(new ErrorResponse('Comment not found', 404));
  }

  comment.deleteOne();
  await post.save();

  res.status(200).json({
    status: 'success',
    message: 'Comment successfully deleted',
    data: {
      commentId: req.params.commentId
    }
  });
});

module.exports = {
  createPost,
  getFeed,
  getPostById,
  getPostsByUser,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment
};