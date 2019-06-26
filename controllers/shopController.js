const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 2;

let getProducts = (req, res, next) => {
    const page = +req.query.page || 1;

    let totalItems;

    Product.find().countDocuments()
    .then(numProducts => {
        totalItems = numProducts;
        return Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'All Products',
            path: '/products',
            totalProducts: totalItems,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPrevPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        });
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });

}

let getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
    .then(product => {
        res.render('shop/product-detail', { 
            product: product, 
            pageTitle: product.title, 
            path: '/products' });
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

let getIndex = (req, res, next) => {
    const page = +req.query.page || 1;

    let totalItems;

    Product.find().countDocuments()
    .then(numProducts => {
        totalItems = numProducts;
        return Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
        res.render('shop/index', { 
            prods: products, 
            pageTitle: 'Shop', 
            path: '/', 
            totalProducts: totalItems,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPrevPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        });
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

let getCart = (req, res, next) => {

    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
        const products = user.cart.items;
        res.render('shop/cart', { path: '/cart', pageTitle: 'Your Cart', products: products });
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

let postCart = (req, res, next) => {
    const prodId = req.body.productId;

    Product.findById(prodId)
    .then(product => {
        return req.user.addToCart(product);
    })
    .then(() => {
        res.redirect('/cart');
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

let postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user.removeFromCart(prodId)
    .then((result) => {
        res.redirect('/cart');
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}


let postOrder = (req, res, next) => {

    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
        const products = user.cart.items.map(i => {
            return { quantity: i.quantity, product: {...i.productId._doc} };
        });

        const order = new Order({
            user: {
                email: req.user.email,
                userId: req.user
            },
            products: products
        });

        return order.save();

    })
    .then((result) => {
        return req.user.clearCart()
    })
    .then(result => {
        res.redirect('/orders');
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

let getOrders = (req, res, next) => {
    Order.find({ 'user.userId': req.user._id })
    .then(orders => {
        res.render('shop/orders', { path: '/orders', pageTitle: 'Your Orders', orders: orders });
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

let getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    const invoiceName = 'invoice-'+orderId+'.pdf';
    const invoicePath = path.join('data', 'invoices', invoiceName);

    Order.findById(orderId)
    .then(order => {
        if(!order) {
            return next(new Error('No order found'));
        }

        if(order.user.userId.toString() !== req.user._id.toString()) {
            return next(new Error('Unauthorized Access'));
        }

        const pdfDoc = new PDFDocument();
        pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');

        pdfDoc.fontSize(26).text('Invoice', {underline: true});
        pdfDoc.text('-------------------------------');
        let totalPrice = 0;
        order.products.forEach(prod => {
            totalPrice += prod.quantity * prod.product.price;
            pdfDoc.fontSize(14).text(prod.product.title+ ' - ' +prod.quantity+ ' X '+'$'+prod.product.price);
        });
        pdfDoc.text('---------------');
        pdfDoc.fontSize(20).text('Total Price: $'+totalPrice);

        pdfDoc.end();

        // fs.readFile(invoicePath, (err, data) => {
        //     if (err) {
        //         return next(err);
        //     }
        //     res.setHeader('Content-Type', 'application/pdf');
        //     // res.setHeader('Content-Disposition', 'inline; filename="'+invoiceName+'"');
        //     res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');
        //     res.send(data);
        // });

        // const file = fs.createReadStream(invoicePath);
        
        // file.pipe(res);

    })
    .catch(err => next(err));
    
}


let getCheckout = (req, res, next) => {
    res.render('shop/checkout', { path: '/checkout', pageTitle: 'Checkout'});
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
    postCartDeleteProduct: postCartDeleteProduct,
    getInvoice: getInvoice
}