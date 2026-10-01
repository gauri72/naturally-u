import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'naturallyu_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // Older builds could save sold-out lines with quantity 0, which then
      // got stuck; drop those so existing shoppers' carts self-repair.
      return stored ? JSON.parse(stored).filter((i) => i.quantity >= 1) : [];
    } catch {
      return []; // corrupted localStorage shouldn't crash the app
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // `stock` is carried onto the cart line so quantity controls can clamp to
  // what's actually available - the server re-validates at order time
  // regardless, but doing it here too means the customer sees the limit
  // instead of silently having their order quietly reduced at checkout.
  //
  // Clamping only ever caps an *increase*: if stock has dropped below what's
  // already in the cart (or to 0), the quantity is left alone rather than
  // being pushed to 0 or forced up, and the cart page flags it instead.
  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const stock = product.stock ?? Infinity;
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product._id
            ? { ...i, quantity: Math.max(i.quantity, Math.min(i.quantity + quantity, stock)), stock }
            : i
        );
      }
      if (stock < 1) return prev; // sold out - nothing to add
      return [...prev, {
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.url,
        quantity: Math.min(quantity, stock),
        stock,
      }];
    });
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  // Decreases always apply (down to 1 - removal is removeItem's job);
  // increases are capped at stock but never below the current quantity.
  // The old Math.max(1, Math.min(q, stock)) forced 0 -> 1 and then pinned
  // the line at 1 whenever stock was 0.
  const updateQuantity = (productId, quantity) => {
    setItems((prev) => prev.map((i) => {
      if (i.productId !== productId) return i;
      const ceiling = i.stock ?? Infinity;
      const next = quantity > i.quantity
        ? Math.max(i.quantity, Math.min(quantity, ceiling))
        : quantity;
      return { ...i, quantity: Math.max(1, next) };
    }));
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
