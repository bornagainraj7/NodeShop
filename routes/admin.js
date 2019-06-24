const express = require('express');
const router = express.Router();
const path = require('path');
const rootDir = require('../utils/path');
const adminController = require('./../controllers/adminController');

const isAuth = require('../middleware/isAuth');

const { body } = require('express-validator');


router.get('/add-product', isAuth, adminController.getAddProduct);

router.post('/add-product', [
        body('title')
            .isString()
            .isLength({min: 3})
            .trim(),
        body('imageUrl').isURL().trim(),
        body('price').isFloat().trim(),
        body('description')
            .isLength({min: 5})
            .trim()
    ], isAuth, adminController.postAddProduct);

router.get('/products', isAuth, adminController.getProducts);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', [
        body('title')
            .trim()
            .isString()
            .isLength({ min: 3 }),
        body('imageUrl').trim().isURL(),
        body('price').trim().isFloat(),
        body('description')
            .trim()
            .isLength({ min: 5 })
    ], isAuth, adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);


module.exports = router;