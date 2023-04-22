const express = require('express');
const controller = require('../controllers/userController');
const { isLoggedIn, isGuest, isAdmin } = require('../middlewares/auth.js');
const { validateUserId, validateSignUp, validateLogIn, validateEmail, validateUsername, validatePassword, validateResult } = require('../middlewares/validator.js');

const router = express.Router();

router.get('/new', isGuest, controller.new);

router.post('/', isGuest, validateSignUp, validateResult, controller.addUser);

router.get('/login', isGuest, controller.login);

router.post('/login', isGuest, validateLogIn, validateResult, controller.processLogin);

router.get('/profile', isLoggedIn, controller.myProfile);

router.get('/profile/:id', isLoggedIn, isAdmin, validateUserId, controller.userProfile);

router.put('/:id/make-admin', isLoggedIn, isAdmin, validateUserId, controller.makeAdmin);

router.put('/:id/ban', isLoggedIn, isAdmin, validateUserId, controller.banUser);

router.put('/:id/unban', isLoggedIn, isAdmin, validateUserId, controller.unbanUser);

router.get('/inbox', isLoggedIn, controller.inbox);

router.get('/settings', isLoggedIn, controller.settings);

router.put('/settings/update-username', isLoggedIn, validateUsername, validateResult, controller.updateUsername);

router.put('/settings/update-password', isLoggedIn, validatePassword, validateResult, controller.updatePassword);

router.get('/admin', isLoggedIn, isAdmin, controller.admin);

router.get('/reset-login', controller.resetLogin);

router.post('/reset-login/send-username', validateEmail, validateResult, controller.sendUsername);

router.post('/reset-login/send-password-reset', validateEmail, validateResult, controller.sendPasswordReset);

router.get('/logout', isLoggedIn, controller.logout);

module.exports = router;
