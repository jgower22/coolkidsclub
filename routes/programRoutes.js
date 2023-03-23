const express = require('express');
const controller = require('../controllers/programController');
const { isLoggedIn, isAdmin, isPatient } = require('../middlewares/auth.js');
const { validateProgramId, validateProgram, validateResult } = require('../middlewares/validator.js');

const router = express.Router();

//Send all programs
router.get('/', isLoggedIn, controller.index);

//Send new program form
router.get('/new', isLoggedIn, isAdmin,  controller.newProgram);

//Save new program to database
router.post('/', isLoggedIn, isAdmin, validateProgram, validateResult, controller.createProgram);

//Show program with specified id
router.get('/:id', validateProgramId, isLoggedIn, controller.showProgram);

//Send edit form for program with specified id
router.get('/:id/edit', validateProgramId, isLoggedIn, isAdmin, controller.editProgram);

//Update the program with specified id
router.put('/:id', validateProgramId, isLoggedIn, isAdmin, validateProgram, validateResult, controller.updateProgram);

//Delete the program with specified id
router.delete('/:id', validateProgramId, isLoggedIn, isAdmin, controller.deleteProgram);

//RSVP for the program with specified id
router.post('/:id/rsvp', validateProgramId, isLoggedIn, isPatient, controller.rsvp);

module.exports = router;