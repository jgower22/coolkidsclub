exports.index = (req, res, next) => {
    res.locals.title = 'Home - Cool Kids Campaign';
    res.render('./index');
};
