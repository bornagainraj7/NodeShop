const User = require('../models/user');
const bcrypt = require('bcryptjs');


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
    .catch(err => confirm.log(err));
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
        })
        .catch(err => console.log(err));;
    })
    .catch(err => console.log(err));
}


let postLogout = (req, res) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
}

module.exports = {
    getLogin: getLogin,
    postLogin: postLogin,
    postLogout: postLogout,
    getSignup: getSignup,
    postSignup: postSignup
}