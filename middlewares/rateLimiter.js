const rateLimit = require('express-rate-limit');

exports.requestLimiter = (maxRequests, errorMessage) => rateLimit({
    windowMs: 60 * 1000, //1 minute time window
    max: maxRequests,
    handler: (req, res, next) => {
        let err = new Error(errorMessage);
        err.status = 429;
        return next(err);
    }
});


