const express = require('express');
const controller = require('../controllers/programController');

const router = express.Router();

router.get('/', controller.index);

router.get('/new', controller.newProgram);

module.exports = router;