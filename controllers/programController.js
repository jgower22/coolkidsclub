const Program = require('../models/program');
const rsvp = require('../models/rsvp');
const { DateTime } = require('luxon');

exports.index = (req, res, next) => {
    res.locals.title = 'Programs - Cool Kids Campaign';
    Program.find({}, { _id: 1, name: 1, startDate: 1, startTime: 1, endDate: 1, endTime: 1 })
        .then(programs => {
            res.render('./program/index', { programs });
        })
        .catch(err => next(err));
};

exports.newProgram = (req, res, next) => {
    res.locals.title = 'New Program - Cool Kids Campaign';
    let data = req.flash('formdata');
    res.render('./program/newProgram', { formData: data[0] });
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

    //rsvp.find( { program: id, user: req.session.user })
    Promise.all([Program.findById(id), rsvp.find({ program: id })])
        .then(results => {
            const [program, rsvps] = results;
            if (program) {
                res.render('./program/showProgram', { program, rsvps, DateTime });
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
                let data = req.flash('formdata');
                res.render('./program/editProgram', { program, formData: data[0] });
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

exports.copyProgram = (req, res, next) => {
    let id = req.params.id;
    Program.findById(id)
        .then(program => {
            let programCopy = program.toObject();
            let previousName = programCopy.name;
            programCopy.name = 'Copy of ' + program.name;
            delete programCopy._id;
            delete programCopy.createdBy;
            delete programCopy.lastModifiedBy;
            delete programCopy.updatedAt;
            delete programCopy.createdAt;
            programCopy.createdBy = res.locals.user;
            programCopy.lastModifiedBy = res.locals.user;

            let programCopyDocument = new Program(programCopy);
            programCopyDocument.save()
                .then(program => {
                    req.flash('success', previousName + ' was copied successfully');
                    res.redirect('/programs');
                })
                .catch(err => next(err));
        })
        .catch(err => next(err));
};

exports.deleteProgram = (req, res, next) => {
    let id = req.params.id;
    //Delete program and all associated RSVPs
    Promise.all([Program.findByIdAndDelete(id, { useFindAndModify: false }), rsvp.deleteMany({ program: id })])
        .then(results => {
            const [program, rsvp] = results;
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