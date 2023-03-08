const User = require('../models/user');
const { generateFromEmail, generateUsername } = require("unique-username-generator");
const generator = require('generate-password');

exports.new = (req, res) => {
    res.render('./user/new');
};

exports.addUser = (req, res, next) => {
    let user = new User(req.body);
    user.firstLogin = true;
    //Users are patients by default
    user.role = 'Patient';
    
    //Generate a username from email
    user.username = generateFromEmail(
        user.email,
        6
    );
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
            //req.flash('error', err.message);
            console.log('ERROR: ' + err);
            return res.redirect('/users/new');
        }

        if (err.code === 11000) {
            console.log(err);
            //req.flash('error', 'Username has been used');
            if (Object.keys(err.keyPattern)[0] == 'username') {
                console.log('ERROR GENERATING USERNAME - TRYING AGAIN.');
                this.addUser(req, res, next);
                return;
            } else {
                console.log('EMAIL IS NOT UNIQUE - PLEASE TRY AGAIN');
            }
            return res.redirect('/users/new');
        }
        next(err);
    })
};

exports.login = (req, res) => {
    res.locals.title = 'Log In - Cool Kids Campaign';
    res.render('./user/login');
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
            console.log('Cannot find username');
            req.flash('error', errorMessage);
            res.redirect('/users/login');
        } else {
            user.comparePassword(password)
            .then(result => {
                if (result) {
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
                    console.log('Error');
                    req.flash('error', errorMessage);
                    res.redirect('/users/login')
                }
            })
        }
    })
    .catch(err => next(err));
};

exports.profile = (req, res, next) => {
    res.render('./user/profile');
};
