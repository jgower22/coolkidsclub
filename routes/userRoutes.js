const express = require('express');
const controller = require('../controllers/userController');

const router = express.Router();

router.get('/new', controller.new);

router.post('/', controller.addUser);

router.get('/login', controller.login);

router.get('/logout', controller.logout);

router.post('/login', controller.processLogin);

module.exports = router;
