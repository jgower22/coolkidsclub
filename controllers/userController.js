const User = require('../models/user');
const Program = require('../models/program');
const rsvp = require('../models/rsvp');
const Token = require('../models/token');
const { generateFromEmail, generateUsername } = require("unique-username-generator");
const generator = require('generate-password');
const { DateTime } = require('luxon');
const { message } = require('../public/javascript/email.js');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const user = require('../models/user');
const bcryptSalt = process.env.BCRYPT_SALT;

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
    } else {
        user.username = generateFromEmail(
            req.body.email,
            numDigits
        );
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

    //Normalize first name for email
    let firstName = req.body.firstName.toLowerCase();
    firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

    let messageOptions = ({
        from: `${process.env.EMAIL}`,
        to: "" + req.body.email + "", //receiver
        subject: "CKC Account Temporary Credentials",
        html: "Hello, " + firstName +
            "<br>Here are your temporary account credentials for the Cool Kids Campaign" +
            "<br>Username: " + user.username +
            "<br>Password: " + password,
    });

    user.save()
        .then(() => {
            let successMessage = 'Account created successfully! Check your email for your username and password.';
            let errorMessage = 'Error sending email with account credentials. Please save these temporary credentials. Username: ' + user.username + ' Password: ' + password;
            message(req, res, messageOptions, successMessage, '/users/login', errorMessage, '/users/login');
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
                    let curEmail = (req.body.tempEmail) ? req.body.tempEmail : req.body.email;
                    let index = curEmail.indexOf('@');

                    //Add random num to end of email
                    req.body.tempEmail = curEmail.slice(0, index) + randomNum + curEmail.slice(index, curEmail.length);
                    this.addUser(req, res, next);
                    return;
                } else {
                    req.flash('error', 'Email has been used');
                    req.flash('formdata', req.body);
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
    let errorMessage = 'Invalid username and/or password';

    User.findOne({ username: username })
        .then(user => {
            if (!user) {
                req.flash('formdata', req.body);
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
                                console.log("success " + Date.now());
                                req.flash('success', 'You have successfully logged in');
                                res.redirect(req.session.returnTo || '/users/profile');
                                delete req.session.returnTo;
                            } else {
                                console.log("success " + Date.now());
                                req.flash('success', 'You have successfully logged in');
                                res.redirect(req.session.returnTo || '/users/profile');
                                delete req.session.returnTo;
                            }
                        } else {
                            req.flash('formdata', req.body);
                            req.flash('error', errorMessage);
                            res.redirect('/users/login');
                        }
                    });
            }
        })
        .catch(err => next(err));
};

exports.myProfile = (req, res, next) => {
    let id = req.session.user;
    Promise.all([User.findById({ _id: id }, { _id: 0, password: 0 }), rsvp.find({ user: id }).populate('program', '_id name startDate endDate startTime endTime')])
        .then(results => {
            const [user, rsvps] = results;
            let adminView = (user.role === 'admin') ? true : false;
            if (user) {
                res.render('./user/profile', { user, rsvps, adminView, DateTime });
            } else {
                let err = new Error('Cannot find user with id: ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

exports.userProfile = (req, res, next) => {
    let id = req.params.id;

    Promise.all([User.findById({ _id: id }, { password: 0 }), rsvp.find({ user: id }).populate('program', '_id name startDate endDate startTime endTime')])
        .then(results => {
            const [user, rsvps] = results;
            let adminView = true;
            if (user) {
                res.render('./user/profile', { user, rsvps, adminView, DateTime });
            } else {
                let err = new Error('Cannot find user with id: ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

exports.inbox = (req, res, next) => {
    res.render('./user/inbox');
};

exports.settings = (req, res, next) => {
    User.findById(req.session.user, { username: 1, firstName: 1, lastName: 1 })
        .then(user => {
            if (user) {
                let data = req.flash('formdata');
                res.render('./user/settings', { user, formData: data[0] });
            } else {
                let err = new Error('Cannot find user account. Please log out and log in again.');
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));

};

exports.admin = (req, res, next) => {
    res.locals.title = 'Admin Tools - Cool Kids Campaign';
    User.find({}, { firstName: 1, lastName: 1, email: 1, role: 1, createdAt: 1, status: 1 })
        .then(users => {
            res.render('./user/admin', { users, DateTime });
        })
        .catch(err => next(err));
};

exports.usersJSON = (req, res, next) => {
    User.find({}, { firstName: 1, lastName: 1, email: 1, role: 1, createdAt: 1, status: 1 })
        .then(users => {
            const dateFormat = { ...DateTime.DATE_SHORT };
            //console.log("before: " + users)
            let formattedUsers = [];
            for (let i = 0; i < users.length; i++) {
                let user = users[i];
                var createdAtDate = new Date(user.createdAt);
                var formattedDate = createdAtDate.toLocaleString(dateFormat);
                formattedDate = formattedDate.split(',')[0];
                user.formattedDate = formattedDate;

                let obj = {
                    name: user.firstName + " " + user.lastName,
                    email: user.email,
                    date: user.formattedDate,
                    role: user.role,
                    id: user._id
                };
                formattedUsers.push(obj);
                //console.log(user.formattedDate);
            }
            //console.log(formattedUsers)
            res.json(formattedUsers);
            //console.log("after: " + users);
            
     
        })
        .catch(err => next(err));
}

exports.makeAdmin = (req, res, next) => {
    let patientId = req.params.id;
    User.findById(patientId)
        .then(user => {
            if (user) {
                user.role = 'admin';
                user.save()
                    .then(user => {
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
};

exports.updateUsername = (req, res, next) => {
    let username = req.body.username;
    User.findById(req.session.user, { username: 1 })
        .then(user => {
            if (user) {
                if (username === user.username) {
                    req.flash('error', 'New username is the same as current username.');
                    req.flash('formdata', req.body);
                    return res.redirect('back');
                }
                user.username = username;
                user.save()
                    .then(user => {
                        console.log('SUCCESS');
                        req.flash('success', 'Username updated successfully');
                        return res.redirect('back');
                    })
                    .catch(err => {
                        if (err.name === 'ValidationError') {
                            req.flash('error', err.message);
                            return res.redirect('back');
                        }

                        if (err.code === 11000) {
                            console.log(err);
                            req.flash('error', 'Username is already taken.');
                            req.flash('formdata', req.body);
                            return res.redirect('back');
                        }
                    });
            } else {
                let err = new Error('Cannot find user account. Please log out and log in again.');
                err.status = 404;
                return next(err);
            }
        })
};

exports.updatePassword = (req, res, next) => {
    User.findById(req.session.user)
        .then(user => {
            if (user) {
                let currentPassword = req.body.password;
                //Check if current password matches with database password
                user.comparePassword(currentPassword)
                    .then(result => {
                        if (result) {
                            let newPassword = req.body.newPassword;
                            let confirmPassword = req.body.confirmPassword;

                            //Check if new/confirm passwords match
                            if (newPassword === confirmPassword) {

                                //Check if new password is different from current password
                                if (currentPassword === newPassword) {
                                    req.flash('error', 'New password is the same as current password.');
                                    req.flash('formdata', req.body);
                                    return res.redirect('back');
                                }

                                //Update password in database
                                user.password = newPassword;
                                user.save()
                                    .then(user => {
                                        req.flash('success', 'Password updated successfully');
                                        return res.redirect('back');
                                    })
                                    .catch(err => {
                                        if (err.name === 'ValidationError') {
                                            req.flash('error', err.message);
                                            return res.redirect('back');
                                        }
                                    });
                            } else {
                                req.flash('error', 'New password must match confirm new password field.');
                                req.flash('formdata', req.body);
                                return res.redirect('back');
                            }
                        } else {
                            req.flash('error', 'Current password is incorrect.');
                            req.flash('formdata', req.body);
                            return res.redirect('back');
                        }
                    });
            } else {
                let err = new Error('Cannot find user account. Please log out and log in again.');
                err.status = 404;
                return next(err);
            }
        })
};

exports.updateFirstName = (req, res, next) => {
    let firstName = req.body.firstName;
    User.findById(req.session.user, { firstName: 1 })
        .then(user => {
            if (user) {
                if (firstName.toLowerCase() === user.firstName.toLowerCase()) {
                    req.flash('error', 'New first name is the same as current first name.');
                    req.flash('formdata', req.body);
                    return res.redirect('back');
                }
                user.firstName = firstName;
                user.save()
                    .then(user => {
                        console.log('SUCCESS');
                        req.flash('success', 'First name updated successfully');
                        return res.redirect('back');
                    })
                    .catch(err => {
                        if (err.name === 'ValidationError') {
                            req.flash('error', err.message);
                            return res.redirect('back');
                        }
                    });
            } else {
                let err = new Error('Cannot find user account. Please log out and log in again.');
                err.status = 404;
                return next(err);
            }
        })
};

exports.updateLastName = (req, res, next) => {
    let lastName = req.body.lastName;
    User.findById(req.session.user, { lastName: 1 })
        .then(user => {
            if (user) {
                if (lastName.toLowerCase() === user.lastName.toLowerCase()) {
                    req.flash('error', 'New last name is the same as current last name.');
                    req.flash('formdata', req.body);
                    return res.redirect('back');
                }
                user.lastName = lastName;
                user.save()
                    .then(user => {
                        console.log('SUCCESS');
                        req.flash('success', 'Last name updated successfully');
                        return res.redirect('back');
                    })
                    .catch(err => {
                        if (err.name === 'ValidationError') {
                            req.flash('error', err.message);
                            return res.redirect('back');
                        }
                    });
            } else {
                let err = new Error('Cannot find user account. Please log out and log in again.');
                err.status = 404;
                return next(err);
            }
        })
};

exports.resetLogin = (req, res) => {
    let data = req.flash('formdata');
    res.locals.title = 'Reset Login - Cool Kids Campaign';
    res.render('./user/resetLogin', { formData: data[0] });
};

exports.sendUsername = (req, res, next) => {
    let userEmail = req.body.email;
    let flashMessage = 'If we found an account associated with that email, then we\'ll send an email with your username.';

    User.findOne({ email: userEmail }, { email: 1, username: 1, firstName: 1 })
        .then(user => {
            if (user) {

                let messageOptions = ({
                    from: `${process.env.EMAIL}`,
                    to: "" + user.email + "", //receiver
                    subject: "CKC Forgot Username Request",
                    html: "Hello, " + user.firstName +
                        "<br>Here is your username that you requested:" +
                        "<br>" + user.username
                });

                message(null, null, messageOptions, null, null, null, null);
                req.flash('success', flashMessage);
                res.redirect('/users/reset-login');
            } else {
                //Cannot find user email
                req.flash('success', flashMessage);
                res.redirect('back');
            }
        })
        .catch(err => next(err));
};

exports.sendPasswordReset = (req, res, next) => {
    let userEmail = req.body.email;
    let flashMessage = 'If we found an account associated with that email, then we\'ll send an email with a password reset link.';

    User.findOne({ email: userEmail }, { username: 1, firstName: 1 })
        .then(user => {
            if (user) {
                let resetToken = crypto.randomBytes(32).toString('hex');

                Token.findOne({ user: user._id })
                    .then(token => {
                        console.log('TOKEN: ' + token);
                        if (token) {
                            token.deleteOne();
                        }
                        bcrypt.hash(resetToken, Number(bcryptSalt))
                            .then(hash => {
                                new Token({
                                    user: user._id,
                                    token: hash,
                                    createdAt: Date.now()
                                }).save()
                                    .then(token => {
                                        let link = `${process.env.CLIENT_URL}/users/reset-password?token=${resetToken}&id=${user._id}`;
                                        console.log('LINK: ' + link);
                                        let messageOptions = ({
                                            from: `${process.env.EMAIL}`,
                                            to: "" + req.body.email + "", //receiver
                                            subject: "CKC Password Reset Link",
                                            html: "Hello, " + user.firstName +
                                                "<br>Here is the password reset link you requested:" +
                                                '<br><p>Click <a href="' + link + '">here</a> to reset your password</p>'
                                        });
                                        message(null, null, messageOptions, null, null, null, null);
                                        req.flash('success', flashMessage);
                                        res.redirect('/users/reset-login');
                                    })
                                    .catch(err => next(err));
                            });
                    })
                    .catch(err => next(err));

            } else {
                //Cannot find user email
                req.flash('success', flashMessage);
                res.redirect('back');
            }
        })
        .catch(err => next(err));
};

exports.resetPasswordForm = (req, res, next) => {
    let data = req.flash('formdata');
    res.locals.title = 'Reset Password - Cool Kids Campaign';
    let query = req._parsedOriginalUrl.query;
    let token = null;
    let id = null;
    if (query) {
        let splitQuery = query.split('&');
        for (let i = 0; i < splitQuery.length; i++) {
            let index = splitQuery[i].indexOf('=');
            let queryString = splitQuery[i].substring(0, index).toLowerCase();
            //Find token
            if (queryString === 'token') {
                token = splitQuery[i].substring(index + 1, splitQuery[i].length);
            }
            //Find id
            if (queryString === 'id') {
                id = splitQuery[i].substring(index + 1, splitQuery[i].length);
            }
        }
    }
    res.render('./user/resetPassword', { formData: data[0], token, id });
}

exports.resetPassword = (req, res, next) => {
    const userId = req.body.id;
    const tokenFromLink = req.body.token;
    console.log('USER ID: ' + userId);
    console.log('TOKEN FROM LINK: ' + tokenFromLink);
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;
    const errorMessage = 'Invalid or expired token';
    Token.findOne({ user: userId })
        .then(token => {
            if (token) {
                //Check if token is valid
                console.log('TOKEN: ' + token);
                bcrypt.compare(tokenFromLink, token.token)
                    .then(result => {
                        console.log('RESULT: ' + result);
                        if (result) {
                            //Token is valid
                            //Check if new/confirm passwords match
                            if (newPassword === confirmPassword) {

                                //Check if new password is different from current password
                                //User.findOne({})
                                //Hash new password and save it
                                bcrypt.hash(newPassword, Number(bcryptSalt))
                                    .then(hash => {
                                        User.updateOne({ _id: userId }, { $set: { password: hash } }, { new: true })
                                            .then(user => {
                                                if (user.modifiedCount > 0) {
                                                    req.flash('success', 'Password reset successfully');
                                                    token.deleteOne();
                                                    return res.redirect('back');
                                                } else {
                                                    req.flash('error', 'New password cannot be the same as current password');
                                                    return res.redirect('back');
                                                }
                                            })
                                            .catch(err => {
                                                if (err.name === 'ValidationError') {
                                                    req.flash('error', err.message);
                                                    return res.redirect('back');
                                                }
                                            });
                                    })
                                    .catch(err => next(err));

                            } else {
                                req.flash('error', 'New password must match confirm new password field.');
                                req.flash('formdata', req.body);
                                return res.redirect('back');
                            }
                        } else {
                            let err = new Error(errorMessage);
                            err.status = 498;
                            next(err);
                        }
                    });
            } else {
                let err = new Error(errorMessage);
                err.status = 498;
                next(err);
            }
        })
};