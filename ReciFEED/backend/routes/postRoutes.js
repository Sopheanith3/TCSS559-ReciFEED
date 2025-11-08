const express = require('express');
const router = express.Router();
const {
  createPost,
  getFeed,
  getPostById,
  getPostsByUser,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// Public routes (with optional auth for feed)
router.get('/feed', optionalAuth, getFeed);
router.get('/user/:userId', getPostsByUser);
router.get('/:id', optionalAuth, getPostById);

// Protected routes
router.post('/', protect, createPost);
router.delete('/:id', protect, deletePost);

// Like/Unlike routes
router.post('/:id/likes', protect, likePost);
router.delete('/:id/likes', protect, unlikePost);

// Comment routes
router.post('/:id/comments', protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router;