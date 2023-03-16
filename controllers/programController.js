const Program = require('../models/program');

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
    
    program.save()
        .then(program => {
            req.flash('Program created successfully');
            res.redirect('/programs');
        })
        .catch(err => next(err));
};

exports.showProgram = (req, res, next) => {
    let id = req.params.id;

    Program.findById(id)
        .then(program => {
            if (program) {
                res.render('./program/showProgram', { program });
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

}