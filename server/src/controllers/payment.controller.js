const asyncHandler = require('express-async-handler');
const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const paymentService = require('../services/payment.service');
const { fulfillPaidOrder } = require('../services/orderFulfillment.service');
const logger = require('../utils/logger');

// GET /api/payments/config - tells the client which payment mode is active
// and, in test/live mode, the Stripe publishable key needed to mount
// Elements. Keeping this server-driven means the client never has to guess
// which flow to render.
const getPaymentConfig = asyncHandler(async (req, res) => {
  res.json({
    mode: paymentService.mode,
    publishableKey: paymentService.isMock ? null : process.env.STRIPE_PUBLISHABLE_KEY || null,
  });
});

// POST /api/payments/mock/confirm  { paymentIntentId, cardNumber }
// Mock-mode only. Simulates what Stripe Elements + the webhook would have
// done: "submit a card", get a synchronous success/decline, and on success
// run the exact same fulfillment pipeline (stock decrement, email, PDF
// receipt) real payments trigger via the webhook. This is what lets the
// whole checkout flow run locally with zero Stripe setup.
const mockConfirmPayment = asyncHandler(async (req, res) => {
  if (!paymentService.isMock) {
    res.status(400);
    throw new Error('Mock payment confirmation is only available when PAYMENT_MODE=mock.');
  }

  const { paymentIntentId, cardNumber } = req.body;
  if (!paymentIntentId) {
    res.status(400);
    throw new Error('paymentIntentId is required.');
  }

  const order = await Order.findOne({ paymentIntentId });
  if (!order) {
    res.status(404);
    throw new Error('No order found for this payment intent.');
  }

  const intent = await paymentService.mockConfirmPayment(paymentIntentId, { cardNumber });

  if (intent.status === 'succeeded') {
    order.paymentStatus = 'paid';
    order.paymentError = undefined;
    await order.save();
    const { emailSimulated } = await fulfillPaidOrder(order._id);
    res.json({
      status: 'succeeded',
      orderId: order._id,
      orderNumber: order.orderNumber,
      emailSimulated, // true = SMTP not configured, no real email was sent - see server/tmp/emails/
    });
  } else {
    order.paymentStatus = 'failed';
    order.paymentError = intent.last_payment_error?.message || 'Card declined';
    await order.save();
    res.status(402).json({
      status: 'failed',
      message: order.paymentError,
    });
  }
});

// GET /api/payments/:orderId/status - lets the client poll/confirm final
// state after redirect (used by the success page and as a fallback if the
// webhook hasn't landed yet).
const getPaymentStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  res.json({
    orderId: order._id,
    orderNumber: order.orderNumber,
    paymentStatus: order.paymentStatus,
    paymentError: order.paymentError,
    confirmationEmailSentAt: order.confirmationEmailSentAt,
    emailSimulated: order.confirmationEmailSimulated,
  });
});

// POST /api/payments/:orderId/refund - admin only (see payment.routes.js).
// Issues the refund via Stripe/mock, restores stock for the order's items,
// and marks the order 'refunded'. In test/live mode Stripe's refund API
// call itself is the source of truth for whether money actually moved; the
// charge.refunded webhook is a secondary confirmation (already handled in
// webhook.controller.js) in case this request's response is lost in transit.
const refundOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.paymentStatus !== 'paid') {
    res.status(400);
    throw new Error(`Only a paid order can be refunded (current status: ${order.paymentStatus}).`);
  }
  if (!order.paymentIntentId) {
    res.status(400);
    throw new Error('This order has no associated payment to refund.');
  }

  await paymentService.refundPayment(order.paymentIntentId);

  order.paymentStatus = 'refunded';
  await order.save();

  // Restore stock - mirrors the decrement in orderFulfillment.service.js.
  // Only restore if we actually decremented it for this order in the first
  // place (stockDecremented guards against restoring stock that was never
  // taken, e.g. a refund issued before fulfillment somehow ran).
  if (order.stockDecremented) {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
  }

  logger.info(`[refund] Order ${order.orderNumber} refunded by admin; stock restored.`);
  res.json({ status: 'refunded', orderId: order._id, orderNumber: order.orderNumber });
});

module.exports = { getPaymentConfig, mockConfirmPayment, getPaymentStatus, refundOrder };
