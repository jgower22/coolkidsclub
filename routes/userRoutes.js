const express = require('express');
const controller = require('../controllers/userController');
const { isLoggedIn, isGuest } = require('../middlewares/auth.js');

const router = express.Router();

router.get('/new', isGuest, controller.new);

router.post('/', isGuest, controller.addUser);

router.get('/login', isGuest, controller.login);

router.post('/login', isGuest, controller.processLogin);

router.get('/profile', isLoggedIn, controller.profile);

router.get('/logout', isLoggedIn, controller.logout);

module.exports = router;
