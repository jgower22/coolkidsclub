const express = require('express');
const controller = require('../controllers/userController');

const router = express.Router();

router.get('/new', controller.new);

router.get('/login', controller.login);

module.exports = router;