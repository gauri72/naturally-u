const asyncHandler = require('express-async-handler');
const Order = require('../models/Order.model');
const paymentService = require('../services/payment.service');
const { fulfillPaidOrder } = require('../services/orderFulfillment.service');
const logger = require('../utils/logger');

// POST /api/payments/webhook (test/live mode only)
// Stripe's source of truth for payment state - the client-side confirmation
// in CheckoutPage tells the *browser* a payment succeeded, but only the
// webhook is authenticated proof it actually cleared, so this (not the
// client) is what triggers fulfillment for real payments.
//
// Registered with express.raw() in app.js (before the JSON body parser) -
// Stripe's signature check needs the exact raw request bytes.
const handleStripeWebhook = asyncHandler(async (req, res) => {
  if (paymentService.isMock) {
    res.status(400).json({ message: 'Stripe webhooks are not used in mock mode. See /api/payments/mock/webhook.' });
    return;
  }

  let event;
  try {
    event = paymentService.constructWebhookEvent(req.body, req.headers['stripe-signature']);
  } catch (err) {
    logger.error(`[webhook] Signature verification failed: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  await routeStripeEvent(event);
  res.json({ received: true });
});

// POST /api/payments/mock/webhook  { type, paymentIntentId }
// Mock-mode equivalent of the above, for exercising the "webhook confirms
// the order" path itself (as opposed to the synchronous mock-confirm
// endpoint, which fulfills inline). Lets you test that fulfillment is
// idempotent and driven by intent-status the same way the real webhook is.
const handleMockWebhook = asyncHandler(async (req, res) => {
  if (!paymentService.isMock) {
    res.status(400).json({ message: 'This endpoint is only available when PAYMENT_MODE=mock.' });
    return;
  }
  const { type, paymentIntentId } = req.body;
  await routeStripeEvent({
    type: type || 'payment_intent.succeeded',
    data: { object: { id: paymentIntentId } },
  });
  res.json({ received: true });
});

async function routeStripeEvent(event) {
  const intentId = event.data?.object?.id;
  if (!intentId) return;

  const order = await Order.findOne({ paymentIntentId: intentId });
  if (!order) {
    logger.warn(`[webhook] No order found for payment intent ${intentId} (event: ${event.type})`);
    return;
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      if (order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.paymentError = undefined;
        await order.save();
      }
      await fulfillPaidOrder(order._id);
      break;

    case 'payment_intent.payment_failed': {
      const failure = event.data.object.last_payment_error?.message;
      order.paymentStatus = 'failed';
      order.paymentError = failure || 'Payment failed';
      await order.save();
      break;
    }

    case 'charge.refunded':
    case 'payment_intent.canceled':
      order.paymentStatus = event.type === 'charge.refunded' ? 'refunded' : 'failed';
      await order.save();
      break;

    default:
      logger.info(`[webhook] Unhandled event type: ${event.type}`);
  }
}

module.exports = { handleStripeWebhook, handleMockWebhook };
