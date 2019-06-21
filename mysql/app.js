const express = require('express');
const app = express();
const path = require('path');

const bodyParser = require('body-parser');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/errorController');
const sequelize = require('./utils/database');

const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');


app.set('view engine', 'ejs');
app.set('views', 'views'); // ('views', 'the folder to find view files to render')


app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));


console.log('server started');

// Dummt Auth middleware
app.use((req, res, next) => {
    User.findAll({where: {id: 1}})
    .then(([user]) => {
        // req.user = user.dataValues;
        req.user = user;
        // console.log(req.user);
        next();
    })
    .catch(err => console.log(err));
});


// Routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404); 

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
Order.belongsToMany(Product, { through: OrderItem });
User.hasMany(Order);


sequelize
.sync()
// .sync({force: true})
.then((result) => {
    return User.findAll({where: {id: 1}})
})
.then(([user]) => {
    if(!user) {
        return User.create({name: 'Raj', email: 'test@test.com'});
    }
    return user;
})
.then((user) => {
    return user.createCart();
})
.then((cart) => {
    app.listen(3000);
})
.catch(err => console.log(err));
// https://www.publicdomainpictures.net/pictures/10000/velka/1-1210009435EGmE.jpg