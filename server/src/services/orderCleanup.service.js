const Order = require('../models/Order.model');
const logger = require('../utils/logger');

// An order that's sat in `pending` payment status for this long was
// abandoned mid-checkout (browser closed, card form given up on, etc.) -
// never confirmed as paid or failed. Long enough that a slow bank redirect
// or a customer stepping away briefly isn't wrongly flagged.
const ABANDON_AFTER_MS = 30 * 60 * 1000; // 30 minutes
const SWEEP_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

// Stock is never decremented for a `pending` order - only fulfillPaidOrder
// does that, on confirmed payment success - so marking an abandoned order
// `failed` here needs no stock restoration. This only prevents pending
// orders from accumulating indefinitely and skewing admin/reporting views.
async function sweepAbandonedOrders() {
  const cutoff = new Date(Date.now() - ABANDON_AFTER_MS);
  const result = await Order.updateMany(
    { paymentStatus: 'pending', createdAt: { $lt: cutoff } },
    { $set: { paymentStatus: 'failed', paymentError: 'Checkout was not completed in time (abandoned).' } }
  );
  if (result.modifiedCount > 0) {
    logger.info(`[cleanup] Marked ${result.modifiedCount} abandoned pending order(s) as failed.`);
  }
}

let intervalHandle = null;

function startOrderCleanupJob() {
  if (intervalHandle) return; // idempotent - don't double-schedule on hot reload
  sweepAbandonedOrders().catch((err) => logger.error(`[cleanup] Initial sweep failed: ${err.message}`));
  intervalHandle = setInterval(() => {
    sweepAbandonedOrders().catch((err) => logger.error(`[cleanup] Sweep failed: ${err.message}`));
  }, SWEEP_INTERVAL_MS);
  intervalHandle.unref?.(); // don't keep the process alive just for this timer
  logger.info(`[cleanup] Abandoned-order cleanup job started (sweeping every ${SWEEP_INTERVAL_MS / 60000}m, abandon threshold ${ABANDON_AFTER_MS / 60000}m).`);
}

function stopOrderCleanupJob() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
}

module.exports = { startOrderCleanupJob, stopOrderCleanupJob, sweepAbandonedOrders };
