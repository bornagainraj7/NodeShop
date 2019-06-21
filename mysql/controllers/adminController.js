const Product = require('./../models/product');

let getAddProduct = (req, res) => {
    res.render('admin/edit-product', {pageTitle: 'Add Product', path: '/admin/add-product', editing: false});
}

let postAddProduct = (req, res) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    req.user.createProduct({
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description
    })
    .then((result) => {
        console.log('Product created!');
        res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
}

let getProducts = (req, res) => {
    req.user.getProducts()
    // Product.findAll()
    .then(products => {
        res.render('admin/products', { prods: products, pageTitle: 'Admin Products', path: '/admin/products' });
    })
    .catch(err => console.log(err));
}

let getEditProduct = (req, res) => {
    const editMode = req.query.edit;
    const prodId = req.params.productId;

    if(!editMode) {
        return res.redirect('/');
    }
    req.user.getProducts({where: {id: prodId}})
    .then((products) => {
        let product = products[0];
        if(!product) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', { pageTitle: 'Edit Product', path: '/admin/edit-product', product: product, editing: editMode });
    })
    .catch(err => console.log(err));

}

let postEditProduct = (req, res) => {
    const prodId = req.body.productId;
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;

    Product.findAll({where: {id: prodId}})
    .then(([product]) => {
        product.title = title;
        product.imageUrl = imageUrl;
        product.price = price;
        product.description = description;

        return product.save();

    })
    .then((result) => {
        console.log('Product Updated!');
        res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
}


let postDeleteProduct = (req, res) => {
    const prodId = req.body.productId;
    Product.destroy({where: {id: prodId}})
    .then((result) => {
        console.log('Product deleted');
        res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
}



module.exports = {
    getAddProduct: getAddProduct,
    postAddProduct: postAddProduct,
    getEditProduct: getEditProduct,
    getProducts: getProducts,
    postEditProduct: postEditProduct,
    postDeleteProduct: postDeleteProduct
}