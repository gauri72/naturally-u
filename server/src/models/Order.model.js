const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  price: Number,
  quantity: { type: Number, required: true, min: 1 },
  image: String,
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    items: [orderItemSchema],
    customer: {
      name: String,
      email: { type: String, required: true },
      phone: String,
    },
    shippingAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    paymentIntentId: { type: String, index: true }, // Stripe payment intent reference; also mock intent ids
    paymentMode: { type: String, enum: ['live', 'test', 'mock'], default: 'mock' },
    paymentError: { type: String }, // last known failure reason, if any
    // Guards the webhook/mock-confirm path against duplicate delivery (Stripe
    // retries webhooks; a mock confirm could double-fire) so stock is only
    // ever decremented once and only one confirmation email is ever sent.
    stockDecremented: { type: Boolean, default: false },
    confirmationEmailSentAt: { type: Date },
    // true when SMTP isn't configured and the confirmation email was only
    // written to server/tmp/emails/ instead of actually sent - lets the API
    // response and admin UI surface this instead of it being a silent log line.
    confirmationEmailSimulated: { type: Boolean, default: false },
    orderStatus: { type: String, enum: ['processing', 'shipped', 'delivered', 'cancelled'], default: 'processing' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
