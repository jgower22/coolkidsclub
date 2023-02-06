exports.new = (req, res) => {
    return res.render('./user/new');
}

exports.login = (req, res, next) => {
    res.render('./user/login');
};