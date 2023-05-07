const express = require('express');
const controller = require('../controllers/userController');
const { isLoggedIn, isGuest, isAdmin, verifyProfileId, isPatient } = require('../middlewares/auth.js');
const { requestLimiter } = require('../middlewares/rateLimiter');
const { validateUserId, validateSignUp, validateLogIn, validateEmail, validateUsername, 
        validatePassword, validateFirstName, validateLastName, validateResult } = require('../middlewares/validator.js');

const router = express.Router();

router.get('/new', isGuest, controller.new);

router.post('/', isGuest, validateSignUp, validateResult, controller.addUser);

router.get('/login', isGuest, controller.login);

router.post('/login', requestLimiter(5, 'Too many login requests. Try again later.'), isGuest, validateLogIn, validateResult, controller.processLogin);

router.get('/profile', isLoggedIn, controller.myProfile);

router.get('/profile/:id', isLoggedIn, verifyProfileId, validateUserId, controller.userProfile);

router.put('/:id/make-admin', isLoggedIn, isAdmin, validateUserId, controller.makeAdmin);

router.put('/:id/remove-admin', isLoggedIn, isAdmin, validateUserId, controller.removeAdmin);

router.put('/:id/ban', isLoggedIn, isAdmin, validateUserId, controller.banUser);

router.put('/:id/unban', isLoggedIn, isAdmin, validateUserId, controller.unbanUser);

router.get('/questions', isLoggedIn, isPatient, controller.questions);

router.get('/settings', isLoggedIn, controller.settings);

router.get('/usersJSON', isLoggedIn, isAdmin, controller.usersJSON);

router.get('/rsvpsJSON/:id', isLoggedIn, verifyProfileId, controller.rsvpsJSON);

router.get('/rsvpsProgramJSON/:id', isLoggedIn, isAdmin, controller.rsvpsProgramJSON);

router.put('/settings/update-username', requestLimiter(5, 'Too many update username requests. Try again later.'), isLoggedIn, validateUsername, validateResult, controller.updateUsername);

router.put('/settings/update-password', requestLimiter(3, 'Too many update password requests. Try again later.'), isLoggedIn, validatePassword, validateResult, controller.updatePassword);

router.put('/settings/update-first-name', requestLimiter(3, 'Too many update first name requests. Try again later.'), isLoggedIn, validateFirstName, validateResult, controller.updateFirstName);

router.put('/settings/update-last-name', requestLimiter(3, 'Too many update last name requests. Try again later.'), isLoggedIn, validateLastName, validateResult, controller.updateLastName);

router.get('/admin', isLoggedIn, isAdmin, controller.admin);

router.get('/reset-login', isGuest, controller.resetLogin);

router.post('/reset-login/send-username', requestLimiter(3, 'Too many send username requests. Try again later.'), isGuest, validateEmail, validateResult, controller.sendUsername);

router.post('/reset-login/send-password-reset', requestLimiter(3, 'Too many reset password requests. Try again later.'), isGuest, validateEmail, validateResult, controller.sendPasswordReset);

router.get('/reset-password', isGuest, controller.resetPasswordForm);

router.put('/reset-password', isGuest, validatePassword, validateResult, controller.resetPassword);

router.get('/logout', isLoggedIn, controller.logout);

module.exports = router;
