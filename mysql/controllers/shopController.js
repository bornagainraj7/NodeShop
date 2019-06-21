const Product = require('../models/product');


let getProducts = (req, res) => {
    Product.findAll()
    .then((products) => {
        res.render('shop/product-list', { prods: products, pageTitle: 'All Products', path: '/products' });
    })
    .catch(err => console.log(err));

}

let getProduct = (req, res) => {
    const prodId = req.params.productId;
    Product.findAll({where: {id: prodId}})
    .then(([product]) => {
        res.render('shop/product-detail', { product: product, pageTitle: product.title, path: '/products' });
    })
    .catch((err) => console.log(err));
}

let getIndex = (req, res) => {
    Product.findAll()
    .then((products) => {
        res.render('shop/index', {prods: products, pageTitle: 'Shop', path: '/'});
    })
    .catch(err => console.log(err));
}

let getCart = (req, res) => {

    req.user.getCart()
    .then((cart) => {
        // console.log(cart)
        return cart.getProducts();
    })
    .then((products) => {
        res.render('shop/cart', { path: '/cart', pageTitle: 'Your Cart', products: products });
    })
    .catch(err => console.log(err));
}

let postCart = (req, res) => {
    const prodId = req.body.productId;
    let fetchedCart;
    let newQuantity = 1;


    req.user.getCart()
    .then((cart) => {
        fetchedCart = cart;
        return cart.getProducts({where: {id: prodId}})
    })
    .then(products => {
        let product;
        if(products.length > 0) {
            product = products[0];
        }
        if(product) {
            const oldQty = product.cartItem.quantity;
            newQuantity = oldQty + 1;
            return [product];
        }
        return Product.findAll({where: {id: prodId}})

    })
    .then(([product]) => {
        // const product = products[0];
        return fetchedCart.addProduct(product, { through: { quantity: newQuantity } });
    })
    .then(() => {
        res.redirect('/cart');
    })
    .catch(err => console.log(err))
}

let postCartDeleteProduct = (req, res) => {
    const prodId = req.body.productId;
    req.user.getCart()
    .then(cart => {
        return cart.getProducts({where: {id: prodId}})
    })
    .then((products) => {
        const product = products[0];
        return product.cartItem.destroy();
    })
    .then((result) => {
        res.redirect('/cart');
    })
    .catch(err => console.log(err));
}

let postOrder = (req, res) => {
    let fetchedCart;

    req.user.getCart()
    .then(cart => {
        fetchedCart = cart;
        return cart.getProducts();
    })
    .then((products) => {
        return req.user.createOrder()
        .then((order) => {
            return order.addProducts(products.map(product => {
                product.orderItem = { quantity: product.cartItem.quantity };
                return product;
            }));
        });
    })
    .then(result => {
        return fetchedCart.setProducts(null);
    })
    .then(result => {
        res.redirect('/orders');
    })
    .catch(err => console.log(err));
}

let getOrders = (req, res) => {
    req.user.getOrders({include: ['products']})
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