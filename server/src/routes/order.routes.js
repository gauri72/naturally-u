const express = require('express');
const { protect } = require('../middleware/auth');
const { optionalCustomer } = require('../middleware/customerAuth');
const {
  createOrder, getOrderById, listOrders, updateOrderStatus,
} = require('../controllers/order.controller');

const router = express.Router();

router.post('/', optionalCustomer, createOrder); // guests or signed-in customers
router.get('/:id', getOrderById);
router.get('/', protect, listOrders);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;
