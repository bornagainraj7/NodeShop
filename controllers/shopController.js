const Product = require('../models/product');
const User = require('../models/user');


let getProducts = (req, res) => {
    Product.fetchAll()
    .then((products) => {
        res.render('shop/product-list', { prods: products, pageTitle: 'All Products', path: '/products' });
    })
    .catch(err => console.log(err));

}

let getProduct = (req, res) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
    .then(product => {
        res.render('shop/product-detail', { product: product, pageTitle: product.title, path: '/products' });
    })
    .catch((err) => console.log(err));
}

let getIndex = (req, res) => {
    Product.fetchAll()
    .then((products) => {
        res.render('shop/index', {prods: products, pageTitle: 'Shop', path: '/'});
    })
    .catch(err => console.log(err));
}

let getCart = (req, res) => {

    req.user.getCart()
    .then(products => {
        res.render('shop/cart', { path: '/cart', pageTitle: 'Your Cart', products: products });
    })
    .catch(err => console.log(err));
}

let postCart = (req, res) => {
    const prodId = req.body.productId;

    Product.findById(prodId)
    .then(product => {
        return req.user.addToCart(product);
    })
    .then(() => {
        res.redirect('/cart');
    })
    .catch(err => console.log(err));
}

let postCartDeleteProduct = (req, res) => {
    const prodId = req.body.productId;
    req.user.deleteItemFromCart(prodId)
    .then((result) => {
        res.redirect('/cart');
    })
    .catch(err => console.log(err));
}


let postOrder = (req, res) => {

    req.user.addOrder()
    .then(result => {
        res.redirect('/orders');
    })
    .catch(err => console.log(err));
}

let getOrders = (req, res) => {
    req.user.getOrders()
    .then(orders => {
        res.render('shop/orders', { path: '/orders', pageTitle: 'Your Orders', orders: orders });
    })
    .catch(err => console.log(err));
}

let getCheckout = (req, res) => {
    res.render('shop/checkout', {path: '/checkout', pageTitle: 'Checkout'});
}


module.exports = {
    getProducts: getProducts,
    getIndex: getIndex,
    getCart: getCart,
    getOrders: getOrders,
    postOrder: postOrder,
    getCheckout: getCheckout,
    getProduct: getProduct,
    postCart: postCart,
    postCartDeleteProduct: postCartDeleteProduct
}