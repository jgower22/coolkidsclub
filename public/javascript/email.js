const nodemailer = require("nodemailer");

exports.message = async (req, res, messageOptions, successMessage, redirectSuccess, errorMessage, redirectError) => {
    const transporter = nodemailer.createTransport({
        service: "gmail.com",
        auth: {
            user: "servermanagementgroup5@gmail.com",
            pass: "iyiezvzvkevmgxan",
        },
    });

    transporter.sendMail(messageOptions, function (error, info) {
        if (error) {
            console.log('Error');
            req.flash('error', errorMessage);
            res.redirect(redirectError);
        } else {
            console.log("Email sent: " + info.response);
            req.flash('success', successMessage);
            res.redirect(redirectSuccess);
        }
    });
};
