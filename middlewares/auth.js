const User = require('../models/user');

//check if user is a guest
exports.isGuest = (req, res, next) => {
    if (!req.session.user) {
        return next();
    } else {
        req.flash('error', 'You are logged in already');
        return res.redirect('/users/profile');
    }
};

//check if user is authenticated
exports.isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        req.flash('error', 'You need to log in first');
        return res.redirect('/users/login');
    }
};

exports.isAdmin = (req, res, next) => {
    User.findById(req.session.user)
        .then(user => {
            if (user) {
                if (user.role === 'admin') {
                    return next();
                } else {
                    let err = new Error('Unauthorized to access the resource');
                    err.status = 401;
                    return next(err);
                }
            } else {
                let err = new Error('Cannot find user account. Please log out and log in again.');
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));
};

exports.isPatient = (req, res, next) => {
    User.findById(req.session.user)
        .then(user => {
            if (user) {
                if (user.role === 'patient') {
                    return next();
                } else {
                    let err = new Error('Unauthorized to access the resource');
                    err.status = 401;
                    return next(err);
                }
            } else {
                let err = new Error('Cannot find user account. Please log out and log in again.');
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));
};