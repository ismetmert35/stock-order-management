const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Ürün rotaları
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
