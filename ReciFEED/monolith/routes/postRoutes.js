const express = require('express');
const router = express.Router();
const { upload } = require('../utils/upload');
const {
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
} = require('../controllers/postController');

// Public routes (no auth required for now)
router.get('/feed', getFeed);
router.get('/user/:userId', getPostsByUser);
router.get('/:id', getPostById);

// Post routes (no auth for now - add later)
router.post('/', upload.array('images', 4), createPost);
router.put('/:id', upload.array('images', 4), updatePost);
router.delete('/:id', deletePost);

// Like/Unlike routes
router.post('/:id/likes', likePost);
router.delete('/:id/likes', unlikePost);

// Comment routes
router.post('/:id/comments', addComment);
router.delete('/:id/comments/:commentId', deleteComment);

module.exports = router;