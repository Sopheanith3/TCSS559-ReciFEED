const Post = require('../models/Post');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const { ErrorResponse, asyncHandler } = require('../utils/errorHandler');

const createPost = asyncHandler(async (req, res, next) => {
  const { content, images, recipeId } = req.body;

  if (!content) {
    return next(new ErrorResponse('Please provide post content', 400));
  }

  const postData = {
    authorId: req.user._id,
    authorName: req.user.username,
    authorImage: req.user.profileImage,
    content,
    images: images || []
  };

  // If recipe is referenced, add recipe info
  if (recipeId) {
    const recipe = await Recipe.findById(recipeId);
    if (recipe) {
      postData.recipeId = recipe._id;
      postData.recipeTitle = recipe.title;
      postData.recipeImage = recipe.images[0] || '';
    }
  }

  const post = await Post.create(postData);

  // Update user's post count
  await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1 } });

  res.status(201).json({
    status: 'success',
    data: post
  });
});


const getFeed = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const sortBy = req.query.sortBy || 'createdAt';
  const order = req.query.order === 'asc' ? 1 : -1;
  
  const skip = (page - 1) * limit;

  const sort = {};
  sort[sortBy] = order;

  const posts = await Post.find()
    .sort(sort)
    .limit(limit)
    .skip(skip);

  // Add isLikedByUser field if user is authenticated
  const postsWithLikeStatus = posts.map(post => {
    const postObj = post.toObject();
    postObj.isLikedByUser = req.user 
      ? post.likes.some(like => like.userId.toString() === req.user._id.toString())
      : false;
    
    // Remove full likes/comments arrays for feed view
    postObj.likes = postObj.likesCount;
    postObj.comments = postObj.commentsCount;
    
    return postObj;
  });

  const total = await Post.countDocuments();

  res.status(200).json({
    status: 'success',
    data: {
      posts: postsWithLikeStatus,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total
      }
    }
  });
});

const getPostById = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  const postData = post.toObject();
  postData.isLikedByUser = req.user
    ? post.likes.some(like => like.userId.toString() === req.user._id.toString())
    : false;

  res.status(200).json({
    status: 'success',
    data: postData
  });
});

const getPostsByUser = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const posts = await Post.find({ authorId: req.params.userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await Post.countDocuments({ authorId: req.params.userId });

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

const deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  // Check if user owns the post
  if (post.authorId.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse('Not authorized to delete this post', 403));
  }

  await post.deleteOne();

  // Update user's post count
  await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: -1 } });

  res.status(200).json({
    status: 'success',
    message: 'Post successfully deleted',
    data: {
      postId: req.params.id
    }
  });
});

const likePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  // Check if already liked
  const alreadyLiked = post.likes.some(
    like => like.userId.toString() === req.user._id.toString()
  );

  if (alreadyLiked) {
    return next(new ErrorResponse('Post already liked', 400));
  }

  // Add like
  post.likes.push({
    userId: req.user._id,
    username: req.user.username,
    profileImage: req.user.profileImage
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
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  // Remove like
  post.likes = post.likes.filter(
    like => like.userId.toString() !== req.user._id.toString()
  );

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
  const { content } = req.body;

  if (!content) {
    return next(new ErrorResponse('Please provide comment content', 400));
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  const comment = {
    userId: req.user._id,
    username: req.user.username,
    userImage: req.user.profileImage,
    content
  };

  post.comments.push(comment);
  await post.save();

  // Get the newly added comment
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

  // Check if user owns the comment or post
  if (
    comment.userId.toString() !== req.user._id.toString() &&
    post.authorId.toString() !== req.user._id.toString()
  ) {
    return next(new ErrorResponse('Not authorized to delete this comment', 403));
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
  deletePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment
};