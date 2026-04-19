const nodemailer = require('nodemailer');

// Check if SMTP is configured
const smtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  : null;

const sendLowStockAlert = async (product, currentStock, threshold) => {
  // Skip silently if SMTP not configured
  if (!smtpConfigured) {
    console.log(`⚠️  Low stock alert (email disabled): ${product.name} — ${currentStock} units remaining`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"Smart Bazaar Alerts" <${process.env.SMTP_USER}>`,
      to: process.env.ALERT_EMAIL,
      subject: `⚠️ Low Stock Alert: ${product.name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
          <div style="background:#C0191D;padding:20px;border-radius:8px 8px 0 0;">
            <h1 style="color:#fff;margin:0;font-size:22px;">Smart Bazaar — Low Stock Alert</h1>
          </div>
          <div style="background:#fff;padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px;">
            <p style="color:#333;font-size:16px;">The following product has fallen below threshold:</p>
            <table style="width:100%;border-collapse:collapse;margin-top:16px;">
              <tr style="background:#f9f9f9;">
                <td style="padding:12px;border:1px solid #eee;font-weight:bold;color:#555;">Product</td>
                <td style="padding:12px;border:1px solid #eee;color:#333;">${product.name}</td>
              </tr>
              <tr>
                <td style="padding:12px;border:1px solid #eee;font-weight:bold;color:#555;">Current Stock</td>
                <td style="padding:12px;border:1px solid #eee;color:#C0191D;font-weight:bold;">${currentStock} units</td>
              </tr>
              <tr style="background:#f9f9f9;">
                <td style="padding:12px;border:1px solid #eee;font-weight:bold;color:#555;">Threshold</td>
                <td style="padding:12px;border:1px solid #eee;color:#333;">${threshold} units</td>
              </tr>
            </table>
            <p style="margin-top:20px;color:#888;font-size:13px;">Please restock as soon as possible. — Smart Bazaar System</p>
          </div>
        </div>
      `
    });
    console.log(`📧 Low stock alert sent for: ${product.name}`);
  } catch (err) {
    console.error('Email alert failed:', err.message);
  }
};

module.exports = { sendLowStockAlert };
