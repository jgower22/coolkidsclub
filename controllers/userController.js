const User = require('../models/user');
const Program = require('../models/program');
const rsvp = require('../models/rsvp');
const { generateFromEmail, generateUsername } = require("unique-username-generator");
const generator = require('generate-password');
const { DateTime } = require('luxon');

exports.new = (req, res) => {
    let data = req.flash('formdata');
    res.locals.title = 'Sign Up - Cool Kids Campaign';
    res.render('./user/new', { formData: data[0] });
};

exports.addUser = (req, res, next) => {
    let user = new User(req.body);
    let numDigits = 6;
    user.firstLogin = true;
    //Users are patients by default
    user.role = 'patient';

    //User will be pending by default
    //user.status = 'pending';
    user.status = 'active';

    //Generate a username from email
    console.log('TEMP EMAIL: ' + req.body.tempEmail);
    if (req.body.tempEmail) {
        //If username has to be regenerated
        user.username = generateFromEmail(
            req.body.tempEmail,
            numDigits
        );

        /*Testing
        if (req.body.tempEmail.length === 7)
            user.username = 'p360165';
        if (req.body.tempEmail.length === 8)
            user.username = 'p8348222';
        if (req.body.tempEmail.length === 9)
            user.username = 'p89784709';
        console.log('TEMP EMAIL HERE: ' + req.body.tempEmail);*/
        
    } else {
        user.username = generateFromEmail(
            req.body.email,
            numDigits
        );

        /*Testing
        if (user.email.length === 7)
            user.username = 'p360165';*/
    }
    console.log('USERNAME: ' + user.username);

    //Generate a random password
    let password = generator.generate({
        length: 10,
        numbers: true,
        uppercase: true
    });
    user.password = password;
    console.log('PASSWORD: ' + password);

    user.save()
        .then(() => {
            req.flash('success', 'Account created successfully! Check your email for your username and password.');
            res.redirect('/users/login');
        })
        .catch(err => {
            if (err.name === 'ValidationError') {
                req.flash('error', err.message);
                console.log('ERROR: ' + err);
                return res.redirect('/users/new');
            }

            if (err.code === 11000) {
                console.log(err);
                //If username already exists, this will run until a unique username is generated
                if (Object.keys(err.keyPattern)[0] == 'username') {
                    let randomNum = Math.floor(Math.random() * 10);
                    let curEmail = (req.body.tempEmail) ? req.body.tempEmail: req.body.email;
                    let index = curEmail.indexOf('@');

                    //Add random num to end of email
                    req.body.tempEmail = curEmail.slice(0, index) + randomNum + curEmail.slice(index, curEmail.length);
                    this.addUser(req, res, next);
                    return;
                } else {
                    req.flash('error', 'Email has been used');
                    return res.redirect('/users/new');
                }
            }
            next(err);
        })
};

exports.login = (req, res) => {
    let data = req.flash('formdata');
    res.locals.title = 'Log In - Cool Kids Campaign';
    res.render('./user/login', { formData: data[0] });
};

exports.logout = (req, res, next) => {
    req.session.destroy(err => {
        if (err)
            return next(err);
        else
            res.redirect('/');
    });
};

exports.processLogin = (req, res, next) => {
    let username = req.body.username;
    if (username)
        username = username.toLowerCase();
    let password = req.body.password;
    let errorMessage = 'Invalid email and/or password';

    User.findOne({ username: username })
        .then(user => {
            if (!user) {
                req.flash('error', errorMessage);
                res.redirect('/users/login');
            } else {
                user.comparePassword(password)
                    .then(result => {
                        if (result) {

                            if (user.status === 'pending') {
                                req.flash('error', 'Please confirm your email address before logging in.');
                                return res.redirect('/users/login');
                            }
                            if (user.status === 'banned') {
                                req.flash('error', 'Your account has been banned.');
                                return res.redirect('/users/login');
                            }

                            req.session.user = user._id;
                            req.session.fullName = user.firstName + ' ' + user.lastName;
                            req.session.email = user.email;
                            req.session.role = user.role;

                            console.log('Success');
                            if (user.firstLogin) {
                                //Redirect to ask user to change username/password
                                //User.findOne({  })
                                res.redirect('/users/profile');
                            } else {
                                req.flash('success', 'You have successfully logged in');
                                res.redirect('/users/profile');
                            }
                        } else {
                            req.flash('error', errorMessage);
                            res.redirect('/users/login');
                        }
                    })
            }
        })
        .catch(err => next(err));
};

exports.myProfile = (req, res, next) => {
    let id = req.session.user;
    User.findById( { _id: id }, { _id: 0, password: 0 })
        .then(user => {
            console.log('USER: ' + user);
            let adminView = false;
            res.render('./user/profile', { user, adminView });
        })
        .catch(err => next(err));
};

exports.userProfile = (req, res, next) => {
    let id = req.params.id;
    console.log('ID: ' + id);
    Promise.all([User.findById( { _id: id }, { password: 0 }), rsvp.find({ user: id }).populate('program', '_id name')])
        .then(results => {
            const [user, rsvps] = results;
            let adminView = true;
            if (user) {
                res.render('./user/profile', { user, rsvps, adminView });
            } else {
                let err = new Error('Cannot find user with id: ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
}

exports.rsvps = (req, res, next) => {
    let id = req.session.user;
    Promise.all([User.find({ _id: id }, { firstName: 1, lastName: 1 }), rsvp.find({ user: id }).populate('program', '_id name')])
        .then(results => {
            const [user, rsvps] = results;
            console.log('USER: ' + user);
            console.log('RSVPS: ' + rsvps);
            res.render('./user/rsvps', { user, rsvps });
        })
        .catch(err => next(err));
};

exports.inbox = (req, res, next) => {
    res.render('./user/inbox');
};

exports.settings = (req, res, next) => {
    res.render('./user/settings');
};

exports.admin = (req, res, next) => {
    res.locals.title = 'Admin Tools - Cool Kids Campaign';
    User.find({}, { firstName: 1, lastName: 1, email: 1, role: 1, createdAt: 1, status: 1 })
        .then(users => {
            res.render('./user/admin', { users, DateTime });
        })
        .catch(err => next(err));
};

exports.makeAdmin = (req, res, next) => {
    let patientId = req.params.id;
    User.findById(patientId)
        .then(user => {
            if (user) {
                user.role = 'admin';
                user.save()
                    .then( user => {
                        req.flash('success', 'User role has been updated to admin.');
                        res.redirect('back');
                    })
                    .catch(err => next(err));
            } else {
                let err = new Error('Cannot find user with id: ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

exports.banUser = (req, res, next) => {
    let patientId = req.params.id;
    User.findById(patientId)
        .then(user => {
            if (user) {
                if (user.role === 'admin') {
                    let err = new Error('You cannot ban other admins');
                    err.status = 400;
                    return next(err);
                }
                if (user.status === 'banned') {
                    let err = new Error('User is already banned');
                    err.status = 400;
                    return next(err);
                }
                user.status = 'banned';
                user.save()
                    .then(user => {
                        req.flash('success', 'User has been banned.');
                        res.redirect('back');
                    })
                    .catch(err => next(err));
            } else {
                let err = new Error('Cannot find user with id: ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

exports.unbanUser = (req, res, next) => {
    let patientId = req.params.id;
    User.findById(patientId)
        .then(user => {
            if (user) {
                if (user.role === 'admin') {
                    let err = new Error('You cannot unban other admins');
                    err.status = 400;
                    return next(err);
                }
                if (user.status === 'active') {
                    let err = new Error('User is not currently banned');
                    err.status = 400;
                    return next(err);
                }
                user.status = 'active';
                user.save()
                    .then(user => {
                        req.flash('success', 'User has been unbanned.');
                        res.redirect('back');
                    })
                    .catch(err => next(err));
            } else {
                let err = new Error('Cannot find user with id: ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
}


