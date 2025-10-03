
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');


const LoginController = require('../controller/auth/LoginController');
 
router.post('/signup', LoginController.signup_google);
router.post('/login', LoginController.login_user);

module.exports = router;