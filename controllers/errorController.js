let get404 = (req, res, next) => {
    // res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
    res.status(404).render('404', {
        pageTitle: '404 Page Not Found', 
        path: '/404',
        isAuthenticated: req.session.isLoggedIn 
    });
}

let get500 = (req, res, next) => {
    res.status(500).render('500', { 
        pageTitle: 'Error', 
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
    });
}

module.exports = {
    get404: get404,
    get500: get500
}