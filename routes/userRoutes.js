const express = require('express');
const controller = require('../controllers/userController');
const { isLoggedIn, isGuest, isAdmin } = require('../middlewares/auth.js');
const { validateUserId } = require('../middlewares/validator.js');

const router = express.Router();

router.get('/new', isGuest, controller.new);

router.post('/', isGuest, controller.addUser);

router.get('/login', isGuest, controller.login);

router.post('/login', isGuest, controller.processLogin);

router.get('/profile', isLoggedIn, controller.myProfile);

router.get('/profile/:id', isLoggedIn, isAdmin, validateUserId, controller.userProfile);

router.get('/rsvps', isLoggedIn, controller.rsvps);

router.get('/inbox', isLoggedIn, controller.inbox);

router.get('/settings', isLoggedIn, controller.settings);

router.get('/admin', isLoggedIn, isAdmin, controller.admin);

router.get('/logout', isLoggedIn, controller.logout);

module.exports = router;
