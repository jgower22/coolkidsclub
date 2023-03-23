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

router.put('/:id/makeAdmin', isLoggedIn, isAdmin, validateUserId, controller.makeAdmin);

router.put('/:id/ban', isLoggedIn, isAdmin, validateUserId, controller.banUser);

router.put('/:id/unban', isLoggedIn, isAdmin, validateUserId, controller.unbanUser);

router.get('/rsvps', isLoggedIn, controller.rsvps);

router.get('/inbox', isLoggedIn, controller.inbox);

router.get('/settings', isLoggedIn, controller.settings);

router.get('/admin', isLoggedIn, isAdmin, controller.admin);

router.get('/logout', isLoggedIn, controller.logout);

module.exports = router;
