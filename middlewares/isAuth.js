const isAuth = (req, res, next) => {
    // console.log('isAuth');
    if(!req.session.isLoggedIn) {
        return res.redirect('/login');
    } else {
        next();
    }
}


module.exports = isAuth;