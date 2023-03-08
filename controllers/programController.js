exports.index = (req, res, next) => {
    res.locals.title = 'Programs - Cool Kids Campaign';
    res.render('./program/index');
};

exports.newProgram = (req, res, next) => {
    res.locals.title = 'New Program - Cool Kids Campaign';
    res.render('./program/new');
}