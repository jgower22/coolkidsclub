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
            console.log('Error sending email');

            if (errorMessage) 
                req.flash('error', errorMessage);
            if (redirectError) 
                res.redirect(redirectError);
        } else {
            console.log("Email sent: " + info.response);

            if (successMessage)
                req.flash('success', successMessage);
            if (redirectSuccess)
                res.redirect(redirectSuccess);
        }
    });
};
