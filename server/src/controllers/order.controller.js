const asyncHandler = require('express-async-handler');
const Order = require('../models/Order.model');

const createOrder = asyncHandler(async (req, res) => {
  const orderNumber = `NU-${Date.now()}`;
  const order = await Order.create({ ...req.body, orderNumber });
  res.status(201).json(order);
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  res.json(order);
});

// Admin
const listOrders = asyncHandler(async (req, res) => {
  res.json(await Order.find().sort('-createdAt'));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: req.body.orderStatus }, { new: true });
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  res.json(order);
});

module.exports = { createOrder, getOrderById, listOrders, updateOrderStatus };
