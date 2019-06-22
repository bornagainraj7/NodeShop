const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoSession = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/errorController');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/NodeDB';
const csrfProtection = csrf();

const User = require('./models/user');

const mongoStore = new MongoSession({
    uri: MONGODB_URI,
    collection: 'sessions'
});


app.set('view engine', 'ejs');
app.set('views', 'views'); // ('views', 'the folder to find view files to render')

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
        secret: 'my-secret-for-this-session', 
        resave: false, 
        saveUninitialized: false, 
        store: mongoStore 
    })
); // Session middleware initialization
app.use(csrfProtection);
app.use(flash());


console.log('server started');

// Dummt Auth middleware
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404); 


mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true })
.then(connect => {
    app.listen(3000);
    console.log('Database connected!');
})
.catch(err => console.log(err));
// https://www.publicdomainpictures.net/pictures/10000/velka/1-1210009435EGmE.jpg
// https://publicdomainpictures.net/pictures/60000/velka/bible-open-to-psalm-118-1378400894gXP.jpg
// https://images.pexels.com/photos/33283/stack-of-books-vintage-books-book-books.jpg?crop=entropy&cs=srgb&dl=antique-black-and-white-books-33283.jpg&fit=crop&fm=jpg&h=426&w=640
