const express = require('express');
const router = express.Router();
const { getAllUsers, getAllOrders, deleteUser } = require('../controllers/admin.controller');
const verifyToken = require('../middleware/auth.middleware');

router.get('/users', verifyToken, getAllUsers);
router.get('/orders', verifyToken, getAllOrders);
router.delete('/users/:id', verifyToken, deleteUser);

module.exports = router;