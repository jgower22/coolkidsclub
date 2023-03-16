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

//Show program with specified id
router.get('/:id', validateId, isLoggedIn, controller.showProgram);

//Send edit form for program with specified id
router.get('/:id/edit', validateId, isLoggedIn, isAdmin, controller.editProgram);

//Update the program with specified id
router.put('/:id', validateId, isLoggedIn, isAdmin, controller.updateProgram);

module.exports = router;