const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const { generateReceiptPdf } = require('./pdf.service');
const { sendOrderConfirmationEmail } = require('./email.service');
const logger = require('../utils/logger');

/**
 * Runs once, exactly once, when an order's payment succeeds - regardless of
 * whether that success was reported by the Stripe webhook or the mock
 * confirm endpoint. Both call sites converge here so stock decrement and
 * the confirmation email never happen twice for the same order (Stripe
 * retries webhook delivery; a flaky client could also double-submit the
 * mock confirm).
 *
 * `order.stockDecremented` is the idempotency guard: it's flipped in the
 * same query that finds the order, via findOneAndUpdate, so two concurrent
 * callers can't both pass the check.
 */
async function fulfillPaidOrder(orderId) {
  const order = await Order.findOneAndUpdate(
    { _id: orderId, stockDecremented: false },
    { $set: { stockDecremented: true } },
    { new: false } // we want the pre-update doc to know if we "won" the race
  );

  if (!order) {
    logger.info(`[fulfillment] Order ${orderId} already fulfilled or not found - skipping (idempotent).`);
    return;
  }

  // Decrement stock. Uses $inc with a floor guard so concurrent orders for
  // the same product can't drive stock negative; if any line item is out of
  // stock by the time payment clears, we still fulfill the order (the
  // customer already paid) but log it for manual follow-up rather than
  // silently overselling further.
  for (const item of order.items) {
    const updated = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } }
    );
    if (!updated) {
      logger.warn(
        `[fulfillment] Order ${order.orderNumber}: insufficient stock for product ${item.product} (wanted ${item.quantity}). Stock not decremented below zero - flag for manual review.`
      );
    }
  }

  // Email + PDF receipt. Failure here shouldn't undo the stock decrement or
  // fail the payment - the order is already paid and stocked; we log and
  // move on so a transient SMTP error doesn't strand a paid order.
  let emailResult = { simulated: true };
  try {
    const pdfBuffer = await generateReceiptPdf(order);
    emailResult = await sendOrderConfirmationEmail(order, pdfBuffer);
    order.confirmationEmailSentAt = new Date();
    order.confirmationEmailSimulated = !!emailResult.simulated;
    await order.save();
  } catch (err) {
    logger.error(`[fulfillment] Order ${order.orderNumber}: failed to send confirmation email - ${err.message}`);
  }

  if (emailResult.simulated) {
    logger.warn(
      `[fulfillment] Order ${order.orderNumber}: SMTP is not configured - no real email was sent. ` +
      `Set SMTP_HOST/SMTP_USER/SMTP_PASSWORD in server/.env to send real emails. ` +
      `Preview saved to ${emailResult.previewPath || 'server/tmp/emails/'}.`
    );
  }

  logger.info(`[fulfillment] Order ${order.orderNumber} fulfilled (stock decremented, email ${emailResult.simulated ? 'simulated' : 'sent'}).`);
  return { emailSimulated: !!emailResult.simulated };
}

module.exports = { fulfillPaidOrder };
