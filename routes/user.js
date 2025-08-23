
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');


const LoginController = require('../controller/auth/LoginController');
const PostController = require('../controller/Post/PostController');

router.post('/login', LoginController.login);
router.get('/comments', auth, LoginController.comments);
router.post('/comments/add', auth, PostController.addPost);
router.post('/upload_image', auth, LoginController.uploadImageController);

module.exports = router;