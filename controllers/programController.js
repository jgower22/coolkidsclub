const Program = require('../models/program');
const rsvp = require('../models/rsvp');

exports.index = (req, res, next) => {
    res.locals.title = 'Programs - Cool Kids Campaign';
    Program.find({})
        .then(programs => {
            res.render('./program/index', { programs });
        })
        .catch(err => next(err));
};

exports.newProgram = (req, res, next) => {
    res.locals.title = 'New Program - Cool Kids Campaign';
    res.render('./program/newProgram');
};

exports.createProgram = (req, res, next) => {
    let program = new Program(req.body);
    program.createdBy = req.session.user;
    program.lastModifiedBy = req.session.user;
    
    program.save()
        .then(program => {
            req.flash('Program created successfully');
            res.redirect('/programs');
        })
        .catch(err => next(err));
};

exports.showProgram = (req, res, next) => {
    let id = req.params.id;

    Promise.all([Program.findById(id), rsvp.find( { program: id, user: req.session.user })])
        .then(results => {
            const [program, rsvp] = results;
            console.log(rsvp);
            if (program) {
                res.render('./program/showProgram', { program, rsvp });
            } else {
                let err = new Error('Cannot find program with id: ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

exports.editProgram = (req, res, next) => {
    let id = req.params.id;

    Program.findById(id)
        .then(program => {
            if (program) {
                res.render('./program/editProgram', { program });
            } else {
                let err = new Error('Cannot find program with id: ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

exports.updateProgram = (req, res, next) => {
    let id = req.params.id;
    let program = req.body;
    Program.findByIdAndUpdate(id, program, { useFindAndModify: false, runValidators: true })
        .then(program => {
            if (program) {
                req.flash('success', 'Program was updated successfully');
                res.redirect('/programs/' + id);
            } else {
                let err = new Error('Cannot find program with id: ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

exports.deleteProgram = (req, res, next) => {
    let id = req.params.id;
    Program.findByIdAndDelete(id)
        .then(program => {
            if (program) {
                req.flash('success', 'Program was deleted successfully');
                res.redirect('/programs');
            } else {
                let err = new Error('Cannot find program with id: ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

exports.rsvp = (req, res, next) => {
    let id = req.params.id;
    const updateObj = {
        response: req.body.response.toLowerCase()
    };
    rsvp.findOneAndUpdate({ user: res.locals.user, program: id}, updateObj, { upsert: true, runValidators: true })
        .then(rsvp => {
            req.flash('success', 'Successfully RSVP\'d for this program');
            res.redirect('/programs/' + id);
        })
        .catch(err => next(err));
};