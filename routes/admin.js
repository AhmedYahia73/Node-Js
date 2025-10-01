
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');


const LoginController = require('../controller/auth/LoginController');
const {getAdmins : getAdmins,
     getItem : getItemAdmin,
     create : createAdmin,
     modify : modifyAdmin,
     delete_item : deleteItemAdmin,
    } = require('../controller/Admin/AdminController');
const {getUserApps : getUserApps,
     getItem : getItemUserApp,
     create : createUserApp,
     modify : modifyUserApp,
     delete_item : delete_itemUserApp,
    } = require('../controller/Admin/UserAppController');
const {getSubscriper, getSubscription, updateSubscription, updateSubscriper} = require('../controller/Admin/SubscriptionController');
const {getPaymob, updatePaymob} = require('../controller/Admin/PaymobController');
const {getUsers, statusUser} = require('../controller/Admin/UserController');

router.post('/login', LoginController.login);

router.get('/admin', auth, getAdmins);
router.get('/admin/:id', auth, getItemAdmin);
router.post('/admin', auth, createAdmin);
router.put('/admin/:id', auth, modifyAdmin);
router.delete('/admin/:id', auth, deleteItemAdmin);

router.get('/user_app', auth, getUserApps);
router.get('/user_app/:id', auth, getItemUserApp);
router.post('/user_app', auth, createUserApp);
router.put('/user_app/:id', auth, modifyUserApp);
router.delete('/user_app/:id', auth, delete_itemUserApp);

router.get('/get_subscriper', auth, getSubscriper);
router.put('/updateSubscriper/:id', auth, updateSubscriper);
router.get('/get_subscription', auth, getSubscription);
router.put('/update_supcription', auth, updateSubscription);

router.get('/getPaymob', auth, getPaymob);
router.put('/updatePaymob', auth, updatePaymob);

router.get('/getUsers', auth, getUsers);
router.put('/statusUser/:id', auth, statusUser);

module.exports = router;