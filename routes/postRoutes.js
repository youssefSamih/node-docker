const express = require('express');

const postController = require('../controllers/postController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(postController.getAllPosts)
  .post(protect, postController.createPost);

router
  .route('/:id')
  .get(protect, postController.getPost)
  .patch(protect, postController.updatePost)
  .delete(protect, postController.deletePost);

module.exports = router;
