const express = require('express');
const controller = require('../controllers/mainController');
const { isLoggedIn } = require('../middlewares/auth.js');

const router = express.Router();

router.get('/', isLoggedIn, controller.index);

module.exports = router;