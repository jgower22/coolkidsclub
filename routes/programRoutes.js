const express = require('express');
const controller = require('../controllers/programController');
const { isLoggedIn, isAdmin } = require('../middlewares/auth.js');

const router = express.Router();

router.get('/', isLoggedIn, controller.index);

router.get('/new', isLoggedIn, isAdmin, controller.newProgram);

module.exports = router;