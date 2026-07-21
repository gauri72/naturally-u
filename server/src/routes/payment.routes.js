const express = require('express');
const { protect } = require('../middleware/auth');
const { getPaymentConfig, mockConfirmPayment, getPaymentStatus, refundOrder } = require('../controllers/payment.controller');
const { handleMockWebhook } = require('../controllers/webhook.controller');

const router = express.Router();

// Note: the real Stripe webhook (POST /api/payments/webhook) is registered
// directly in app.js with express.raw() body parsing, before this router is
// mounted with the JSON parser - Stripe's signature verification needs the
// untouched raw request body.

router.get('/config', getPaymentConfig);
router.post('/mock/confirm', mockConfirmPayment);
router.post('/mock/webhook', handleMockWebhook);
router.get('/:orderId/status', getPaymentStatus);
router.post('/:orderId/refund', protect, refundOrder); // admin only

module.exports = router;
