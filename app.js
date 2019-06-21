const express = require('express');
const app = express();
const path = require('path');

const bodyParser = require('body-parser');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/errorController');

const mongoConnect = require('./utils/database').mongoConnect;

const User = require('./models/user');


app.set('view engine', 'ejs');
app.set('views', 'views'); // ('views', 'the folder to find view files to render')


app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));


console.log('server started');

// Dummt Auth middleware
app.use((req, res, next) => {
    User.findById('5d0b9e4571f2c20070bd27d3')
    .then(user => {
        req.user = new User(user.name, user.email, user.cart, user._id);
        next();
    })
    .catch(err => console.log(err));
})


// Routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404); 


mongoConnect(() => {
    app.listen(3000);
});
// https://www.publicdomainpictures.net/pictures/10000/velka/1-1210009435EGmE.jpg
// https://images.pexels.com/photos/33283/stack-of-books-vintage-books-book-books.jpg?crop=entropy&cs=srgb&dl=antique-black-and-white-books-33283.jpg&fit=crop&fm=jpg&h=426&w=640
