const express = require('express');
const controller = require('../controllers/programController');
const { isLoggedIn, isAdmin } = require('../middlewares/auth.js');
const { validateId } = require('../middlewares/validator.js');

const router = express.Router();

//Send all programs
router.get('/', isLoggedIn, controller.index);

//Send new program form
router.get('/new', isLoggedIn, isAdmin, controller.newProgram);

//Save new program to database
router.post('/', isLoggedIn, isAdmin, controller.createProgram);

router.get('/:id', validateId, isLoggedIn, controller.showProgram);

module.exports = router;