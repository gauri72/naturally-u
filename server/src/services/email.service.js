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

// Sender shown in the inbox, e.g. NaturallyU <naturallyuindia@gmail.com>.
// dotenv strips the outer quotes from EMAIL_FROM="..." in a .env file, but
// a hosting dashboard (Render) keeps them - and a fully quoted value parses
// as an address with NO display name, so Gmail showed the bare address.
// Strip one pair of wrapping quotes here so both forms work. Without
// EMAIL_FROM, send as the SMTP account itself (Gmail rewrites any other
// address anyway).
function fromAddress() {
  const raw = (process.env.EMAIL_FROM || '').trim();
  const value = /^(["']).*\1$/.test(raw) ? raw.slice(1, -1).trim() : raw;
  if (value) return value;
  return process.env.SMTP_USER ? `"NaturallyU" <${process.env.SMTP_USER}>` : '"NaturallyU" <orders@naturallyu.com>';
}

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
    from: fromAddress(),
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

// The name is customer-typed, so escape it before it goes into HTML.
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function renderAccountEmailHtml({ name, heading, body, ctaLabel, ctaUrl, footnote }) {
  name = name ? escapeHtml(name) : name;
  return `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background:${COLORS.background};font-family:Verdana,Geneva,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.background};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${COLORS.border};">
            <tr>
              <td style="background:${COLORS.primary};padding:24px 32px;text-align:center;">
                <div style="font-family:Georgia,'Times New Roman',serif;color:#ffffff;font-size:22px;font-weight:700;">NaturallyU</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="font-family:Georgia,'Times New Roman',serif;color:${COLORS.text};font-size:20px;margin:0 0 12px;">${heading}</h1>
                <p style="color:${COLORS.textMuted};font-size:14px;line-height:1.6;margin:0 0 24px;">Hi ${name || 'there'}, ${body}</p>
                <p style="margin:0 0 24px;text-align:center;">
                  <a href="${ctaUrl}" style="display:inline-block;background:${COLORS.primary};color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;">${ctaLabel}</a>
                </p>
                <p style="color:${COLORS.textMuted};font-size:12px;line-height:1.6;margin:0;">${footnote}<br/><br/>Button not working? Copy this link into your browser:<br/><span style="word-break:break-all;color:${COLORS.primary};">${ctaUrl}</span></p>
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
 * Account emails (confirm address, reset password). Same dev fallback as
 * the order email: without SMTP the HTML is saved to server/tmp/emails/.
 */
async function sendAccountEmail({ to, subject, ...content }) {
  const html = renderAccountEmailHtml(content);
  const client = getTransporter();
  if (!client || devFallback) {
    const dir = path.join(__dirname, '..', '..', 'tmp', 'emails');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${Date.now()}_account.html`);
    fs.writeFileSync(file, html);
    logger.info(`[email:dev] SMTP not configured - would have sent "${subject}" to ${to}. Saved preview to ${file}`);
    return { simulated: true, previewPath: file };
  }
  const info = await client.sendMail({
    from: fromAddress(),
    to,
    subject,
    html,
  });
  logger.info(`[email] "${subject}" sent to ${to} (messageId=${info.messageId})`);
  return { simulated: false, messageId: info.messageId };
}

function renderNewOrderNotificationHtml(order) {
  const { customer = {}, shippingAddress = {} } = order;
  const address = [
    shippingAddress.line1,
    shippingAddress.line2,
    [shippingAddress.postalCode, shippingAddress.city].filter(Boolean).join(' '),
    shippingAddress.state,
    shippingAddress.country,
  ].filter(Boolean).map(escapeHtml).join('<br/>');
  const itemsRows = (order.items || [])
    .map(
      (item) => `<tr><td style="padding:4px 0;">${escapeHtml(item.name)} &times; ${item.quantity}</td><td style="padding:4px 0;text-align:right;">${currency(item.price * item.quantity)}</td></tr>`
    )
    .join('');

  return `
  <div style="font-family:Verdana,Geneva,sans-serif;color:${COLORS.text};font-size:14px;line-height:1.6;max-width:560px;">
    <h2 style="font-family:Georgia,'Times New Roman',serif;color:${COLORS.primary};margin:0 0 12px;">New order ${order.orderNumber}</h2>
    <p style="margin:0 0 16px;">Paid ${currency(order.total)} (${order.paymentMode || 'unknown'} payment).</p>
    <table role="presentation" width="100%" style="border-top:1px solid ${COLORS.border};border-bottom:1px solid ${COLORS.border};margin-bottom:16px;">
      ${itemsRows}
      <tr><td style="padding:4px 0;color:${COLORS.textMuted};">Shipping</td><td style="padding:4px 0;text-align:right;color:${COLORS.textMuted};">${order.shippingCost ? currency(order.shippingCost) : 'Free'}</td></tr>
      <tr><td style="padding:4px 0;font-weight:700;">Total</td><td style="padding:4px 0;text-align:right;font-weight:700;">${currency(order.total)}</td></tr>
    </table>
    <p style="margin:0 0 4px;"><strong>Customer:</strong> ${escapeHtml(customer.name || '-')}</p>
    <p style="margin:0 0 4px;"><strong>Email:</strong> ${escapeHtml(customer.email || '-')}</p>
    <p style="margin:0 0 16px;"><strong>Phone:</strong> ${escapeHtml(customer.phone || '-')}</p>
    <p style="margin:0;"><strong>Ship to:</strong><br/>${address || '-'}</p>
  </div>`;
}

/**
 * Notifies the shop that a paid order came in. Goes to ORDER_NOTIFY_EMAIL,
 * falling back to SMTP_USER (the shop's own mailbox). Reply-To is the
 * customer so the shop can answer them directly. Skipped (logged only) when
 * SMTP isn't configured, same as the customer email.
 */
async function sendNewOrderNotificationEmail(order) {
  const to = process.env.ORDER_NOTIFY_EMAIL || process.env.SMTP_USER;
  const subject = `New order ${order.orderNumber} - ${currency(order.total)}`;

  const client = getTransporter();
  if (!client || devFallback || !to) {
    logger.info(`[email:dev] SMTP not configured - would have sent shop notification "${subject}".`);
    return { simulated: true };
  }

  const info = await client.sendMail({
    from: fromAddress(),
    to,
    replyTo: order.customer?.email,
    subject,
    html: renderNewOrderNotificationHtml(order),
  });
  logger.info(`[email] New order notification sent to ${to} (messageId=${info.messageId})`);
  return { simulated: false, messageId: info.messageId };
}

module.exports = { sendOrderConfirmationEmail, sendAccountEmail, sendNewOrderNotificationEmail };
