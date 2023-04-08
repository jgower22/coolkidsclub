const { body } = require('express-validator');
const { validationResult } = require('express-validator');

exports.validateProgramId = (req, res, next) => {
    let id = req.params.id;
    //an objectId is a 24-bit Hex string
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid program id');
        err.status = 400;
        return next(err);
    } else {
        return next();
    }
};

exports.validateUserId = (req, res, next) => {
    let id = req.params.id;
    //an objectId is a 24-bit Hex string
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid user id');
        err.status = 400;
        return next(err);
    } else {
        return next();
    }
};

exports.validateResult = (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        //Load form data into flash
        req.flash('formdata', req.body);
        //req.flash('usernameFormData', req.body);
        //req.flash('passwordFormData', req.body);
        return res.redirect('back');
    } else {
        return next();
    }
};

exports.validateSignUp = [body('firstName', 'First name cannot be empty').notEmpty().isAlpha().withMessage('First name can only contain letters').trim().escape(),
body('lastName', 'Last name cannot be empty').notEmpty().isAlpha().withMessage('Last name can only contain letters').trim().escape(),
body('email', 'Email must be a valid email address').isEmail().normalizeEmail({ gmail_remove_dots: false }).trim().escape()];

exports.validateLogIn = [body('username', 'Username cannot be empty').isLength({ min: 7, max: 64 }).withMessage('Username must be at least 7 characters and at most 64 characters').trim().escape(),
body('password', 'Password must be at least 8 characters and at most 64 characters').isLength({ min: 8, max: 64 })];

exports.validateUsername = [body('username', 'Username cannot be empty').isLength({ min: 7, max: 64}).withMessage('Username must be at least 7 characters and at most 64 characters')
    .isAlphanumeric().withMessage('Username can only contain letters and numbers').trim().escape()];

exports.validateProgram = [body('name').isLength({ min: 2 }).withMessage('Program name must be at least 2 characters').trim().escape(),
body('location').isLength({ min: 2 }).withMessage('Program location must be at least 2 characters').trim().escape(),
body('startDate').isDate().withMessage('Start date must be a valid date').trim().escape(),
body('startTime').isTime().withMessage('Start time must be a valid time').trim().escape(),
body('endDate').isDate().withMessage('End date must be a valid date').custom((value, { req }) => {
    let startDate = req.body.startDate;
    let endDate = value;

    if (endDate < startDate) {
        throw new Error('End date must be on or after start date');
    }

    return true;
}).trim().escape(),
body('endTime').isTime().withMessage('End time must be a valid time').custom((value, { req }) => {
    let startDate = req.body.startDate;
    let startTime = req.body.startTime;
    let endDate = req.body.endDate;
    let endTime = value;

    if (startDate === endDate) {
        if (endTime <= startTime) {
            throw new Error('End time must later than start time');
        }
    }

    return true;
}).trim().escape(),
body('details').isLength({ min: 3}).withMessage('Program details must be at least 3 characters').trim().escape()];

exports.validateRSVP = [body('response', 'RSVP response must be \'yes\' or \'no\'').toLowerCase().isIn(['yes', 'no']).trim().escape()];