const asyncHandler = require('express-async-handler');
const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const paymentService = require('../services/payment.service');

// Re-validates items against live product data server-side (mirrors
// cart.controller.validateCart) so a tampered client payload can never
// create an order at a price/stock the server didn't itself compute.
async function buildValidatedOrderItems(items) {
  const validated = [];
  let subtotal = 0;
  for (const { productId, quantity } of items || []) {
    const product = await Product.findById(productId);
    if (!product || !product.isActive) continue;
    const qty = Math.max(1, Math.min(Number(quantity) || 1, product.stock));
    if (qty <= 0) continue;
    subtotal += product.price * qty;
    validated.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: qty,
      image: product.images?.[0]?.url,
    });
  }
  return { items: validated, subtotal };
}

// Creates a fresh order in `pending` payment status and, in the same call,
// a matching Payment Intent (mock or real Stripe depending on
// PAYMENT_MODE) - the client only ever needs orderId + clientSecret to
// drive the rest of checkout.
const createOrder = asyncHandler(async (req, res) => {
  const { items, customer, shippingAddress } = req.body;
  const { items: validatedItems, subtotal } = await buildValidatedOrderItems(items);

  if (validatedItems.length === 0) {
    res.status(400);
    throw new Error('No valid items in cart. Products may be out of stock or unavailable.');
  }
  if (!customer?.email) {
    res.status(400);
    throw new Error('Customer email is required.');
  }

  const shippingCost = 0; // flat free shipping for now; see CartPage/CheckoutPage copy
  const total = subtotal + shippingCost;
  const orderNumber = `NU-${Date.now()}`;

  const order = await Order.create({
    orderNumber,
    items: validatedItems,
    customer,
    shippingAddress,
    subtotal,
    shippingCost,
    total,
    paymentMode: paymentService.mode,
    paymentStatus: 'pending',
  });

  const intent = await paymentService.createPaymentIntent({
    amount: total,
    currency: 'eur',
    metadata: { orderId: order._id.toString(), orderNumber },
    // Stable per-order key: a client-side retry of this request (e.g. after
    // a timeout) reuses the same Stripe Payment Intent instead of creating
    // a second one for the same order.
    idempotencyKey: `order_${order._id.toString()}`,
  });

  order.paymentIntentId = intent.id;
  await order.save();

  res.status(201).json({
    order,
    clientSecret: intent.client_secret,
    paymentIntentId: intent.id,
    paymentMode: paymentService.mode,
  });
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
