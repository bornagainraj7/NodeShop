let get404 = (req, res, next) => {
    // res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
    res.status(404).render('404', { pageTitle: '404 Page Not Found', path: '/404' });
}

module.exports = {
    get404: get404
}