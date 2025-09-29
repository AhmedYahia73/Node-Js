
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');


const LoginController = require('../controller/auth/LoginController');
const {getAdmins, getItem, create, modify, delete_item} = require('../controller/Admin/AdminController');

router.post('/login', LoginController.login);

router.get('/admin', auth, getAdmins);
router.get('/admin/:id', auth, getItem);
router.post('/admin', auth, create);
router.put('/admin/:id', auth, modify);
router.delete('/admin/:id', auth, delete_item);

module.exports = router;