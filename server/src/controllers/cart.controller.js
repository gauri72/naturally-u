const asyncHandler = require('express-async-handler');

// NOTE: Cart is intentionally NOT persisted server-side by default —
// it lives in the client (CartContext + localStorage) for a snappier
// UX. This endpoint exists for price/stock re-validation at checkout
// time, so stale client-side prices never get charged.
const Product = require('../models/Product.model');

const validateCart = asyncHandler(async (req, res) => {
  const { items } = req.body; // [{ productId, quantity }]
  const validated = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || !product.isActive) continue;
    const quantity = Math.min(item.quantity, product.stock);
    subtotal += product.price * quantity;
    validated.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images?.[0]?.url,
    });
  }

  res.json({ items: validated, subtotal });
});

module.exports = { validateCart };
