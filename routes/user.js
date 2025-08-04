
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');


const LoginController = require('../controller/auth/LoginController');

router.post('/login', LoginController.login);
router.get('/comments', auth, LoginController.comments);
router.post('/upload_image', auth, LoginController.uploadImageController);

module.exports = router;