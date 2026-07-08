const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createOrder, getOrderById, listOrders, updateOrderStatus,
} = require('../controllers/order.controller');

const router = express.Router();

router.post('/', createOrder);
router.get('/:id', getOrderById);
router.get('/', protect, listOrders);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;
