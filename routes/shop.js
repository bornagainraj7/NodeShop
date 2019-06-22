const express = require('express');
const router = express.Router();
const path = require('path');
const rootDir = require('../utils/path');
const shopController = require('./../controllers/shopController');

const isAuth = require('../middleware/isAuth');


router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

router.post('/create-order', isAuth, shopController.postOrder);

router.get('/orders', isAuth, shopController.getOrders);

// router.get('/checkout', isAuth, shopController.getCheckout);


module.exports = router;