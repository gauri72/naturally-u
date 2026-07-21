const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * Payment service abstraction.
 * -----------------------------
 * PAYMENT_MODE=mock (default) - no Stripe account/keys needed. Simulates a
 *   Payment Intent lifecycle in-memory/in-DB so the whole checkout flow
 *   (create -> confirm -> webhook-equivalent -> order fulfillment) can be
 *   exercised locally. Card number ending in 0002 simulates a decline;
 *   everything else simulates success - mirrors Stripe's own test-card
 *   convention so switching to real test-mode Stripe later needs no UI
 *   changes.
 * PAYMENT_MODE=test|live - wraps the real Stripe SDK using
 *   STRIPE_SECRET_KEY. Both modes only need PAYMENT_MODE flipped and the
 *   key/webhook secret dropped into .env; no code changes.
 *
 * Both branches expose the same interface so callers (payment.controller,
 * webhook handling) don't need to know which mode is active.
 */

const MODE = (process.env.PAYMENT_MODE || 'mock').toLowerCase();
const isMock = MODE === 'mock';

let stripeClient = null;
function getStripeClient() {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error(
        `PAYMENT_MODE=${MODE} requires STRIPE_SECRET_KEY to be set in .env`
      );
    }
    // eslint-disable-next-line global-require
    stripeClient = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

const centsFromAmount = (amount) => Math.round(amount * 100);

// ---- Mock backend ---------------------------------------------------------
// Payment Intents are held in memory only (a real Stripe intent similarly
// isn't stored in our DB until we choose to persist its id on the order).
// A server restart loses in-flight mock intents, which is fine for local
// testing - not meant to survive process restarts.
const mockIntents = new Map();

function mockCreateIntent({ amount, currency, metadata }) {
  const id = `pi_mock_${crypto.randomBytes(12).toString('hex')}`;
  const clientSecret = `${id}_secret_${crypto.randomBytes(8).toString('hex')}`;
  const intent = {
    id,
    client_secret: clientSecret,
    amount: centsFromAmount(amount),
    currency,
    status: 'requires_payment_method',
    metadata: metadata || {},
  };
  mockIntents.set(id, intent);
  return intent;
}

// Mirrors Stripe's documented test-card behavior: a card number ending in
// 0002 always declines, everything else succeeds. Lets the UI's card form
// double as both the mock and (later) real Stripe Elements test flow.
function mockConfirmIntent(id, { cardNumber } = {}) {
  const intent = mockIntents.get(id);
  if (!intent) {
    const err = new Error('No such payment_intent (mock)');
    err.statusCode = 404;
    throw err;
  }
  const declined = typeof cardNumber === 'string' && cardNumber.replace(/\s/g, '').endsWith('0002');
  intent.status = declined ? 'requires_payment_method' : 'succeeded';
  intent.last_payment_error = declined
    ? { message: 'Your card was declined.', code: 'card_declined' }
    : undefined;
  mockIntents.set(id, intent);
  return intent;
}

function mockRetrieveIntent(id) {
  const intent = mockIntents.get(id);
  if (!intent) {
    const err = new Error('No such payment_intent (mock)');
    err.statusCode = 404;
    throw err;
  }
  return intent;
}

// ---- Public interface -------------------------------------------------

/**
 * Create a Payment Intent for the given order total.
 * @param {{ amount: number, currency?: string, metadata?: object, idempotencyKey?: string }} params
 *   amount in major units (e.g. euros). `idempotencyKey` should be stable
 *   per-order (we pass the order's _id) so that a network retry of the
 *   create-order request - e.g. the client times out waiting for a response
 *   that actually succeeded server-side, and retries - reuses the same
 *   Stripe Payment Intent instead of minting a second one for the same
 *   order. Stripe deduplicates by this key for 24h. Mock mode doesn't need
 *   this: intents live in an in-process Map keyed by our own generated id,
 *   there's no network hop to Stripe to retry against.
 */
async function createPaymentIntent({ amount, currency = 'eur', metadata = {}, idempotencyKey }) {
  if (isMock) {
    logger.info(`[payment:mock] creating intent for €${amount.toFixed(2)}`);
    return mockCreateIntent({ amount, currency, metadata });
  }
  const stripe = getStripeClient();
  return stripe.paymentIntents.create(
    {
      amount: centsFromAmount(amount),
      currency,
      metadata,
      automatic_payment_methods: { enabled: true },
    },
    idempotencyKey ? { idempotencyKey } : undefined
  );
}

/**
 * Mock-mode only: simulate the card submission a customer would make via
 * Stripe Elements, without any real card network involved. Real mode never
 * calls this - Stripe Elements confirms the payment client-side and the
 * webhook is the source of truth (see webhook.controller.js).
 */
async function mockConfirmPayment(paymentIntentId, { cardNumber } = {}) {
  if (!isMock) {
    throw new Error('mockConfirmPayment called outside PAYMENT_MODE=mock');
  }
  return mockConfirmIntent(paymentIntentId, { cardNumber });
}

async function retrievePaymentIntent(paymentIntentId) {
  if (isMock) return mockRetrieveIntent(paymentIntentId);
  const stripe = getStripeClient();
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Refund a paid order. In mock mode this just flips the in-memory intent's
 * status - there's no real money to move. In test/live mode this issues a
 * real Stripe refund against the charge behind the Payment Intent; the
 * `charge.refunded` webhook event (already handled in webhook.controller.js)
 * is what ultimately marks the order 'refunded' for a real payment, so this
 * function only kicks the refund off - it doesn't assume success synchronously.
 */
async function refundPayment(paymentIntentId) {
  if (isMock) {
    const intent = mockIntents.get(paymentIntentId);
    if (!intent) {
      const err = new Error('No such payment_intent (mock)');
      err.statusCode = 404;
      throw err;
    }
    if (intent.status !== 'succeeded') {
      const err = new Error('Only a succeeded payment can be refunded.');
      err.statusCode = 400;
      throw err;
    }
    intent.status = 'refunded';
    mockIntents.set(paymentIntentId, intent);
    logger.info(`[payment:mock] refunded intent ${paymentIntentId}`);
    return { id: `re_mock_${crypto.randomBytes(8).toString('hex')}`, status: 'succeeded' };
  }
  const stripe = getStripeClient();
  return stripe.refunds.create({ payment_intent: paymentIntentId });
}

/**
 * Verify + parse an incoming Stripe webhook. In mock mode there is no
 * webhook signature to check - the mock webhook route
 * (POST /api/payments/mock/webhook) is trusted directly since it's only
 * reachable in mock mode and simulates what Stripe would have sent.
 */
function constructWebhookEvent(rawBody, signature) {
  if (isMock) {
    throw new Error('constructWebhookEvent is not used in mock mode');
  }
  const stripe = getStripeClient();
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is required to verify webhooks in test/live mode');
  }
  return stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
}

module.exports = {
  mode: MODE,
  isMock,
  createPaymentIntent,
  mockConfirmPayment,
  retrievePaymentIntent,
  refundPayment,
  constructWebhookEvent,
};
