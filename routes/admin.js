const express = require('express');
const router = express.Router();
const path = require('path');
const rootDir = require('../utils/path');
const adminController = require('./../controllers/adminController');

const isAuth = require('../middleware/isAuth');

router.get('/add-product', isAuth, adminController.getAddProduct);

router.post('/add-product', isAuth, adminController.postAddProduct);

router.get('/products', isAuth, adminController.getProducts);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', isAuth, adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);


module.exports = router;