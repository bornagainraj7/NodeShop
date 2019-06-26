const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoSession = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const shortId = require('shortid');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/errorController');
const shopController = require('./controllers/shopController');
const isAuth = require('./middlewares/isAuth');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/NodeDB';
const csrfProtection = csrf();

const User = require('./models/user');

const mongoStore = new MongoSession({
    uri: MONGODB_URI,
    collection: 'sessions'
});

// multer
const MIME_TYPE_MAP = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg"
}
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        let name = shortId.generate();
        let ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, 'image'+Date.now()+name+'.'+ext);
    }
});

const fileMimeFilters = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}
// multer ends

app.set('view engine', 'ejs');
app.set('views', 'views'); // ('views', 'the folder to find view files to render')

app.use(bodyParser.urlencoded({extended: false}));
app.use(multer({ storage: fileStorage, fileFilter: fileMimeFilters}).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, '/images')));
app.use(
    session({
        secret: 'my-secret-for-this-session', 
        resave: false, 
        saveUninitialized: false, 
        store: mongoStore 
    })
); // Session middleware initialization

app.use(flash());


console.log('server started');

app.use((req, res, next) => {
    if (req.session.user) {
        res.locals.email = req.session.user.email;
    } else {
        res.locals.email = '';
    }
    res.locals.isAuthenticated = req.session.isLoggedIn;
    next();
});

// Dummt Auth middleware
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if(!user) {
                return next();
            }
            req.user = user;
            // console.log(req.session.isLoggedIn);
            next();
        })
        .catch(err => {
            console.log(err);
            next(new Error(err));
        });
});

// Route logger
app.use((req, res, next) => {
    console.log(req.method + " " + req.originalUrl);
    next();
})


app.post('/create-order', isAuth, shopController.postOrder);

app.use(csrfProtection);

app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);


app.use('/500', errorController.get500);
app.use(errorController.get404); 

// global error handler   
app.use((error, req, res, next) => {
    console.log(req.method + " " + req.originalUrl);
    console.log(error);
    let isAuthenticated;
    if (req.session) {
        isAuthenticated = req.session.isLoggedIn;
    } else {
        isAuthenticated = false;
    }
    res.status(500).render('500', {
        pageTitle: 'Error',
        path: '/500',
        isAuthenticated: isAuthenticated
    });
});

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true })
.then(connect => {
    app.listen(3000);
    console.log('Database connected!');
})
.catch(err => console.log(err));
// https://www.publicdomainpictures.net/pictures/10000/velka/1-1210009435EGmE.jpg
// https://publicdomainpictures.net/pictures/60000/velka/bible-open-to-psalm-118-1378400894gXP.jpg
// https://images.pexels.com/photos/33283/stack-of-books-vintage-books-book-books.jpg?crop=entropy&cs=srgb&dl=antique-black-and-white-books-33283.jpg&fit=crop&fm=jpg&h=426&w=640
