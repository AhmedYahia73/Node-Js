
const express = require('express');
const router = express.Router();
const {auth_user} = require('../middleware/auth');


const LoginController = require('../controller/auth/LoginController');
router.post('/signup', LoginController.signup_google);
router.post('/login', LoginController.login_user);
router.post('/determineGoogleEmail', LoginController.determineGoogleEmail);

const {getdata: getPaymobList, payment: paymentPaymob, paymobCallback} = require('../controller/User/PaymentController');
router.get('/getPaymobList', auth_user, getPaymobList);
router.post('/paymentPaymob', auth_user, paymentPaymob);
router.get('/paymobCallback', paymobCallback);

const {getUsers, startApp} = require('../controller/User/UsersController');
router.get('/getUsers', auth_user, getUsers);
router.post('/startApp', auth_user, startApp);

module.exports = router;