const express = require('express');
const router = express.Router();
const { getAllProducts, addProduct, updateProduct, deleteProduct } = require('../controllers/product.controller');
const verifyToken = require('../middleware/auth.middleware');

router.get('/', getAllProducts);
router.post('/add', verifyToken, addProduct);
router.put('/update/:id', verifyToken, updateProduct);
router.delete('/delete/:id', verifyToken, deleteProduct);

module.exports = router;