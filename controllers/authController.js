const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');

const crypto = require('crypto');


const transporter = nodemailer.createTransport(sendGridTransport({
    auth: {
        api_key: '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'
    }
}));


let getLogin = (req, res) => {
    // const isLoggedIn = req.get('Cookie').trim().split('=')[1] === 'true';
    let message = req.flash('error');
    if(message.length > 0) {
        message = message[0]
    } else {
        message = null;
    }

    res.render('auth/login', { 
        pageTitle: "Login", 
        path: '/login',
        errorMessage: message
    });
}

let getSignup = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null;
    }

    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message
    });
};


let postLogin = (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email: email})
    .then(user => {
        if(!user) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/login');
        }

        bcrypt.compare(password, user.password)
        .then(isMatch => {
            if(isMatch) {
                req.session.isLoggedIn = true;
                req.session.user = user;
                req.session.save(err => {
                    if(err) {
                        console.log(err);
                        return res.redirect('/');
                    } else {
                        return res.redirect('/');
                    }
                });

            } else {
                req.flash('error', 'Invalid email or password');
                res.redirect('/login');
            }
        })
        .catch(err => {
            console.log(err);
            res.redirect('/login');
        })
    })
    .catch(err => console.log(err));
}

let postSignup = (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    User.findOne({ email: email })
    .then(userData => {
        if(userData) {
            req.flash('error', 'Email already registered.');
            return res.redirect('/signup');
        }

        return bcrypt.hash(password, 10)
        .then(hashedPasword => {
            const user = new User({
                email: email,
                password: hashedPasword,
                cart: { items: [] }
            });
            return user.save();
        })
        .then(result => {
            res.redirect('/login');

            return transporter.sendMail({
                to: email,
                from: 'no-reply@nodeshop.com',
                subject: 'Signup successful',
                html: '<h1>Hey Welcome, your account was successfully created.</h1>'
            });
        })
        .catch(err => console.log(err));;
    })
    .catch(err => console.log(err));
}


let postLogout = (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            console.log(err);
        }
        res.redirect('/');
    });
}


let getReset = (req, res) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null;
    }
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message
    });
}

let postReset = (req, res) => {
    crypto.randomBytes(32, (err, buffer) => {
        if(err) {
            console.log(err);
            return res.redirect('/reset')
        }

        const token = buffer.toString('hex');// 'hex' required by toString() to convert hexadecimal to ascii

        User.findOne({email: req.body.email})
        .then(user => {
            if(!user) {
                req.flash('error', 'No account with that email found');
                return res.redirect('/reset');
            }

            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save();
        })
        .then(result => {
            transporter.sendMail({
                to: req.body.email,
                from: 'no-reply@nodeshop.com',
                subject: 'Password Reset',
                html: `
                <h4>As per your recent password reset request,</h4>
                <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
                <p>Remember the above link is valid for only <strong>one hour</strong>.</p>
                `
            });
            res.redirect('/');
        })
        .catch(err => console.log(err));
    });
}

let getNewPassword = (req, res) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
        let message = req.flash('error');
        if (message.length > 0) {
            message = message[0]
        } else {
            message = null;
        }
        res.render('auth/new-password', {
            path: '/new-password',
            pageTitle: 'New Password',
            errorMessage: message,
            userId: user._id.toString(),
            passwordToken: token
        });
    })
    .catch(err => console.log(err));
}

let postNewPassword = (req, res) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() }, _id: userId })
    .then(user => {
        resetUser = user;
        return bcrypt.hash(newPassword, 10);
    })
    .then(hashedPasword => {
        resetUser.password = hashedPasword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
    })
    .then(() => {
        res.redirect('/login');
    })
    .catch(err => console.log(err));


}


module.exports = {
    getLogin: getLogin,
    postLogin: postLogin,
    postLogout: postLogout,
    getSignup: getSignup,
    postSignup: postSignup,
    getReset: getReset,
    postReset: postReset,
    getNewPassword: getNewPassword,
    postNewPassword: postNewPassword
}