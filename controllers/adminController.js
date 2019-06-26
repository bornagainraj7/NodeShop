const Product = require('./../models/product');
const fileHelper = require('../utils/file');
const {validationResult} = require('express-validator');


let getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', { 
        pageTitle: 'Add Product', 
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    });
}

let postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    const errors = validationResult(req);


    if (!image) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                description: description
            },
            errorMessage: 'Attached file is not an image.',
            validationErrors: []
        });
    }
    

    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                imageUrl: imageUrl,
                price: price,
                description: description
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }

    const imageUrl = image.path;

    const product = new Product({
        // _id: new mongoose.Types.ObjectId('5badf72403fd8b5be0366e81'),
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user
    });
    product.save()
    .then(result => {
        // console.log(result);
        console.log('Product created!');
        res.redirect('/admin/products');
    })
    .catch(err => {
        // res.redirect('/500');
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}


let getProducts = (req, res, next) => {
    Product.find({userId: req.user._id})
    // .populate('userId', 'name')
    .then((products) => {
        res.render('admin/products', { prods: products, pageTitle: 'Admin Products', path: '/admin/products' });
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}


let getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    const prodId = req.params.productId;

    if(!editMode) {
        return res.redirect('/');
    }
    Product.findById(prodId)
    .then((product) => {
        if(!product) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', { 
            pageTitle: 'Edit Product', 
            path: '/admin/edit-product', 
            product: product, 
            editing: editMode,
            hasError: false,
            errorMessage: null,
            validationErrors: []
        });
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

let postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const title = req.body.title;
    const price = req.body.price;
    const image = req.file;
    const description = req.body.description;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            product: {
                title: title,
                price: price,
                description: description,
                _id: prodId
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }

    Product.findById(prodId)
    .then(product => {
        if (product.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/');
        }
        product.title = title;
        product.price = price;
        product.description = description;
        if (image) {
            fileHelper.deleteFile(product.imageUrl);
            product.imageUrl = image.path;
        }
        return product.save().then(result => {
            console.log('Product updated!');
            res.redirect('/admin/products');
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}


let postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;

    Product.findById(prodId)
    .then(product => {
        if(!product) {
            return next(new Error('Product not found.'));
        }
        fileHelper.deleteFile(product.imageUrl);

        return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(() => {
        console.log('Product deleted');
        res.redirect('/admin/products');
    })
    .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}


let deleteProduct = (req, res, next) => {
    const prodId = req.params.productId;

    Product.findById(prodId)
    .then(product => {
        if (!product) {
            return next(new Error('Product not found.'));
        }
        fileHelper.deleteFile(product.imageUrl);

        return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(() => {
        console.log('Product deleted');
        res.status(201).json({
            error: false,
            message: 'Product deleted',
            errorMessage: null
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: true,
            message: 'Product deleting failed',
            errorMessage: err
        });
    });
}



module.exports = {
    getAddProduct: getAddProduct,
    postAddProduct: postAddProduct,
    getEditProduct: getEditProduct,
    getProducts: getProducts,
    postEditProduct: postEditProduct,
    postDeleteProduct: postDeleteProduct,
    deleteProduct: deleteProduct
}