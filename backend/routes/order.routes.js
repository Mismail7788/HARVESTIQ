const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getVendorOrders, updateOrderStatus } = require('../controllers/order.controller');
const verifyToken = require('../middleware/auth.middleware');

router.post('/create', verifyToken, createOrder);
router.get('/my-orders', verifyToken, getMyOrders);
router.get('/vendor-orders', verifyToken, getVendorOrders);
router.put('/status/:id', verifyToken, updateOrderStatus);

module.exports = router;