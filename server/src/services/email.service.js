const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Mirrors client/src/styles/base/variables.css.
const COLORS = {
  primary: '#3FA34D',
  accentDark: '#D4A017',
  background: '#FFF7E6',
  brown: '#8A6E51',
  text: '#2B2B28',
  textMuted: '#6B6B63',
  border: '#E8E0CC',
};

const currency = (n) => `€${Number(n).toFixed(2)}`;

let transporter = null;
let devFallback = true;

function getTransporter() {
  if (transporter) return transporter;
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    devFallback = false;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return transporter; // null when unconfigured - caller falls back to dev mode
}

// The site's Playfair Display / Quicksand fonts aren't available in email
// clients, so we lean on widely-supported serif/sans-serif fallbacks that
// echo the same look (a serif heading font, clean sans body).
function renderOrderEmailHtml(order) {
  const itemsRows = (order.items || [])
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid ${COLORS.border};color:${COLORS.text};font-size:14px;">${item.name}<br/><span style="color:${COLORS.textMuted};font-size:12px;">Qty ${item.quantity}</span></td>
          <td style="padding:10px 0;border-bottom:1px solid ${COLORS.border};color:${COLORS.text};font-size:14px;text-align:right;white-space:nowrap;">${currency(item.price * item.quantity)}</td>
        </tr>`
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background:${COLORS.background};font-family:Verdana,Geneva,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.background};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${COLORS.border};">
            <tr>
              <td style="background:${COLORS.primary};padding:28px 32px;text-align:center;">
                <div style="font-family:Georgia,'Times New Roman',serif;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0.5px;">NaturallyU</div>
                <div style="color:#eafcee;font-size:12px;margin-top:4px;">Handmade soaps &amp; skin care</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="font-family:Georgia,'Times New Roman',serif;color:${COLORS.text};font-size:22px;margin:0 0 8px;">Thank you for your order!</h1>
                <p style="color:${COLORS.textMuted};font-size:14px;line-height:1.6;margin:0 0 24px;">
                  Hi ${order.customer?.name || 'there'}, we've received your order and it's being lovingly handcrafted. A full receipt is attached as a PDF.
                </p>

                <table role="presentation" width="100%" style="background:${COLORS.background};border-radius:8px;padding:16px;margin-bottom:24px;">
                  <tr>
                    <td style="padding:4px 12px;color:${COLORS.textMuted};font-size:12px;">Order Number</td>
                    <td style="padding:4px 12px;color:${COLORS.text};font-size:12px;text-align:right;font-weight:700;">${order.orderNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 12px;color:${COLORS.textMuted};font-size:12px;">Order Date</td>
                    <td style="padding:4px 12px;color:${COLORS.text};font-size:12px;text-align:right;">${new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                  </tr>
                </table>

                <table role="presentation" width="100%" style="margin-bottom:8px;">
                  ${itemsRows}
                </table>

                <table role="presentation" width="100%" style="margin-top:12px;">
                  <tr>
                    <td style="padding:4px 0;color:${COLORS.textMuted};font-size:13px;">Subtotal</td>
                    <td style="padding:4px 0;color:${COLORS.text};font-size:13px;text-align:right;">${currency(order.subtotal)}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:${COLORS.textMuted};font-size:13px;">Shipping</td>
                    <td style="padding:4px 0;color:${COLORS.text};font-size:13px;text-align:right;">${order.shippingCost ? currency(order.shippingCost) : 'Free'}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0 0;color:${COLORS.primary};font-size:16px;font-weight:700;border-top:1px solid ${COLORS.border};">Total</td>
                    <td style="padding:10px 0 0;color:${COLORS.primary};font-size:16px;font-weight:700;text-align:right;border-top:1px solid ${COLORS.border};">${currency(order.total)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background:${COLORS.background};padding:20px 32px;text-align:center;border-top:1px solid ${COLORS.border};">
                <p style="color:${COLORS.textMuted};font-size:12px;margin:0;">Questions about your order? Just reply to this email.</p>
                <p style="color:${COLORS.textMuted};font-size:11px;margin:12px 0 0;">&copy; ${new Date().getFullYear()} NaturallyU. Handcrafted with love.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
}

/**
 * Sends the branded order confirmation email with the PDF receipt attached.
 * Falls back to logging + writing the rendered HTML and PDF to
 * server/tmp/emails/ when SMTP isn't configured, so the entire post-payment
 * pipeline (including "what would have been emailed") can be exercised
 * locally with zero setup.
 */
async function sendOrderConfirmationEmail(order, pdfBuffer) {
  const html = renderOrderEmailHtml(order);
  const subject = `Your NaturallyU order ${order.orderNumber} is confirmed`;
  const to = order.customer?.email;

  const client = getTransporter();
  if (!client || devFallback) {
    const dir = path.join(__dirname, '..', '..', 'tmp', 'emails');
    fs.mkdirSync(dir, { recursive: true });
    const base = `${Date.now()}_${order.orderNumber}`;
    fs.writeFileSync(path.join(dir, `${base}.html`), html);
    fs.writeFileSync(path.join(dir, `${base}.pdf`), pdfBuffer);
    logger.info(
      `[email:dev] SMTP not configured - would have sent "${subject}" to ${to}. Saved preview to server/tmp/emails/${base}.html (+ .pdf)`
    );
    return { simulated: true, previewPath: path.join(dir, `${base}.html`) };
  }

  const info = await client.sendMail({
    from: process.env.EMAIL_FROM || '"NaturallyU" <orders@naturallyu.com>',
    to,
    subject,
    html,
    attachments: [
      {
        filename: `NaturallyU-Receipt-${order.orderNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
  logger.info(`[email] Order confirmation sent to ${to} (messageId=${info.messageId})`);
  return { simulated: false, messageId: info.messageId };
}

module.exports = { sendOrderConfirmationEmail };
