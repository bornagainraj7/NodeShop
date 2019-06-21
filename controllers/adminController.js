const Product = require('./../models/product');


let getAddProduct = (req, res) => {
    res.render('admin/edit-product', {pageTitle: 'Add Product', path: '/admin/add-product', editing: false});
}

let postAddProduct = (req, res) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const product = new Product(title, price, description, imageUrl, null, req.user._id);
    product.save()
    .then((result) => {
        console.log('Product created!');
        // console.log(result);
        res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
}

let getProducts = (req, res) => {
    Product.fetchAll()
    .then((products) => {
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
    Product.findById(prodId)
    .then((product) => {
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


    const product = new Product(title, price, description, imageUrl, prodId);

    return product.save()
    .then((result) => {
        console.log('Product Updated!');
        res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
}


let postDeleteProduct = (req, res) => {
    const prodId = req.body.productId;
    Product.deleteById(prodId)
    .then(() => {
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