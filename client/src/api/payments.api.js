import axiosClient from './axiosClient';

// Server-driven: tells the client whether to render Stripe Elements or the
// mock card form, and (in test/live mode) the publishable key to mount
// Elements with.
export const getPaymentConfig = () => axiosClient.get('/payments/config');

// Mock mode only - simulates submitting a card to Stripe. Card number
// ending in 0002 simulates a decline (mirrors Stripe's own test-card
// convention), anything else succeeds.
export const mockConfirmPayment = (paymentIntentId, cardNumber) =>
  axiosClient.post('/payments/mock/confirm', { paymentIntentId, cardNumber });

export const getPaymentStatus = (orderId) => axiosClient.get(`/payments/${orderId}/status`);

// Admin only. Issues the refund (Stripe/mock), restores stock, marks the
// order 'refunded'.
export const refundOrder = (orderId) => axiosClient.post(`/payments/${orderId}/refund`);
