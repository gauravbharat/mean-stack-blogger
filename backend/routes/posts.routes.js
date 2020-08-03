const express = require('express');
const router = express.Router();

const checkAuth = require('../middleware/check-auth.middleware');
const extractFile = require('../middleware/multer.middleware');
const PostsController = require('../controllers/posts.controller');

router.post('', checkAuth, extractFile, PostsController.addPost);
router.put('/:id', checkAuth, extractFile, PostsController.updatePost);
router.get('', PostsController.getPosts);
router.get('/:id', PostsController.getPost);
router.delete('/:id', checkAuth, PostsController.deletePost);

module.exports = router;
