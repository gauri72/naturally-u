const PDFDocument = require('pdfkit');
const path = require('path');

// Mirrors client/src/styles/base/variables.css so the receipt matches the
// storefront's brand palette exactly.
const COLORS = {
  primary: '#3FA34D',
  accentDark: '#D4A017',
  background: '#FFF7E6',
  brown: '#8A6E51',
  text: '#2B2B28',
  textMuted: '#6B6B63',
  border: '#E8E0CC',
};

const LOGO_PATH = path.join(__dirname, '..', 'assets', 'logo.png');
const currency = (n) => `€${Number(n).toFixed(2)}`;

/**
 * Renders a branded PDF receipt for a paid order and resolves with the PDF
 * as a Buffer (kept in memory - receipts are small and this avoids managing
 * a tmp-file lifecycle; the caller attaches the buffer directly to the
 * confirmation email).
 */
function generateReceiptPdf(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header: logo + invoice meta
    try {
      doc.image(LOGO_PATH, 50, 45, { width: 90 });
    } catch {
      // Logo missing shouldn't block receipt generation
    }
    doc
      .fillColor(COLORS.text)
      .fontSize(20)
      .text('NaturallyU', 160, 50, { align: 'right' })
      .fontSize(9)
      .fillColor(COLORS.textMuted)
      .text('Handmade soaps & skin care', 160, 74, { align: 'right' });

    doc.moveDown(3);
    doc
      .moveTo(50, 130)
      .lineTo(545, 130)
      .strokeColor(COLORS.border)
      .lineWidth(1)
      .stroke();

    // Invoice meta block
    const metaTop = 150;
    doc.fillColor(COLORS.text).fontSize(16).text('Receipt', 50, metaTop);
    doc
      .fontSize(10)
      .fillColor(COLORS.textMuted)
      .text(`Invoice / Order #: ${order.orderNumber}`, 50, metaTop + 26)
      .text(`Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}`, 50, metaTop + 42)
      .text(`Payment status: ${order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus}`, 50, metaTop + 58);

    // Billed-to block
    doc
      .fontSize(10)
      .fillColor(COLORS.text)
      .text('Billed to', 350, metaTop, { width: 195, align: 'left' })
      .fillColor(COLORS.textMuted)
      .text(order.customer?.name || order.customer?.email || '', 350, metaTop + 16, { width: 195 });
    if (order.customer?.email) doc.text(order.customer.email, 350, doc.y, { width: 195 });
    if (order.shippingAddress?.line1) {
      const addr = order.shippingAddress;
      doc.text(
        [addr.line1, addr.line2, [addr.city, addr.postalCode].filter(Boolean).join(' '), addr.country]
          .filter(Boolean)
          .join('\n'),
        350,
        doc.y,
        { width: 195 }
      );
    }

    // Line items table
    let y = 260;
    doc.moveTo(50, y).lineTo(545, y).strokeColor(COLORS.border).stroke();
    y += 10;

    doc.fontSize(9).fillColor(COLORS.textMuted);
    doc.text('ITEM', 50, y);
    doc.text('QTY', 350, y, { width: 50, align: 'right' });
    doc.text('PRICE', 400, y, { width: 70, align: 'right' });
    doc.text('TOTAL', 470, y, { width: 75, align: 'right' });
    y += 16;
    doc.moveTo(50, y).lineTo(545, y).strokeColor(COLORS.border).stroke();
    y += 10;

    doc.fontSize(10).fillColor(COLORS.text);
    (order.items || []).forEach((item) => {
      const rowHeight = 20;
      doc.text(item.name, 50, y, { width: 290 });
      doc.text(String(item.quantity), 350, y, { width: 50, align: 'right' });
      doc.text(currency(item.price), 400, y, { width: 70, align: 'right' });
      doc.text(currency(item.price * item.quantity), 470, y, { width: 75, align: 'right' });
      y += rowHeight;
    });

    y += 6;
    doc.moveTo(50, y).lineTo(545, y).strokeColor(COLORS.border).stroke();
    y += 14;

    const totalsRow = (label, value, opts = {}) => {
      doc
        .fontSize(opts.big ? 13 : 10)
        .fillColor(opts.big ? COLORS.primary : COLORS.textMuted)
        .text(label, 350, y, { width: 120, align: 'left' })
        .fillColor(opts.big ? COLORS.primary : COLORS.text)
        .text(value, 470, y, { width: 75, align: 'right' });
      y += opts.big ? 22 : 18;
    };

    totalsRow('Subtotal', currency(order.subtotal));
    totalsRow('Shipping', order.shippingCost ? currency(order.shippingCost) : 'Free');
    y += 4;
    doc.moveTo(350, y).lineTo(545, y).strokeColor(COLORS.border).stroke();
    y += 10;
    totalsRow('Total', currency(order.total), { big: true });

    // Footer
    doc
      .fontSize(9)
      .fillColor(COLORS.textMuted)
      .text(
        'Thank you for shopping with NaturallyU. Handcrafted with love, made to order.',
        50,
        740,
        { width: 495, align: 'center' }
      );

    doc.end();
  });
}

module.exports = { generateReceiptPdf };
