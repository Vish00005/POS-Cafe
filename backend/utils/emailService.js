import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const sendOrderReceipt = async (order) => {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const FROM_EMAIL = process.env.FROM_EMAIL || "no-reply@odoocafeteria.com";
  const FROM_NAME = process.env.FROM_NAME || "Odoo Cafeteria";

  if (!BREVO_API_KEY) {
    console.error(`❌ [Order ${order.orderNumber}] Brevo API Key missing. Receipt not sent.`);
    return;
  }

  const recipientEmail =
    order.email || (order.customer && order.customer.email);

  console.log(`[Order ${order.orderNumber}] Preparing to send receipt to: ${recipientEmail || "None found"}`);

  if (!recipientEmail) {
    console.log("ℹ️ No recipient email found for order", order.orderNumber);
    return;
  }

  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px;">
        ${item.name} <span style="color: #64748b;">x${item.quantity}</span>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 14px; text-align: right; font-weight: 600;">
        ₹${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `,
    )
    .join("");

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        .header { background: #4f46e5; padding: 40px 20px; text-align: center; color: white; }
        .content { padding: 32px 24px; }
        .footer { background: #f1f5f9; padding: 24px; text-align: center; color: #64748b; font-size: 12px; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; }
        .badge-paid { background: #dcfce7; color: #166534; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div style="font-size: 24px; font-weight: 800; letter-spacing: -0.025em; margin-bottom: 8px;">ODOO CAFETERIA</div>
          <div style="font-size: 14px; opacity: 0.9;">Premium Dining Experience</div>
        </div>
        <div class="content">
          <div style="text-align: center; margin-bottom: 32px;">
            <div class="badge badge-paid">Payment Received</div>
            <h2 style="margin: 0; color: #0f172a; font-size: 20px;">Order Receipt</h2>
            <p style="margin: 4px 0 0; color: #64748b; font-size: 14px;">Order #${order.orderNumber}</p>
          </div>

          <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 24px; display: flex; justify-content: space-between;">
            <div>
              <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Table</div>
              <div style="font-size: 16px; font-weight: 700; color: #1e293b;">${order.tableNumber}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Date</div>
              <div style="font-size: 14px; color: #1e293b;">${new Date(order.createdAt).toLocaleDateString("en-IN")}</div>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="text-align: left; font-size: 11px; color: #94a3b8; text-transform: uppercase; padding-bottom: 8px; border-bottom: 2px solid #f1f5f9;">Item</th>
                <th style="text-align: right; font-size: 11px; color: #94a3b8; text-transform: uppercase; padding-bottom: 8px; border-bottom: 2px solid #f1f5f9;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-top: 24px; border-top: 2px solid #f1f5f9; padding-top: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #64748b; font-size: 14px;">Payment Method</span>
              <span style="color: #1e293b; font-size: 14px; font-weight: 600; text-transform: uppercase;">${order.paymentMethod}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
              <span style="color: #0f172a; font-size: 18px; font-weight: 800;">Total Amount</span>
              <span style="color: #4f46e5; font-size: 24px; font-weight: 800;">₹${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div style="margin-top: 40px; text-align: center; background: #e0e7ff; border-radius: 12px; padding: 20px;">
            <div style="font-size: 14px; color: #4338ca; font-weight: 600;">Thank you for dining with us!</div>
            <div style="font-size: 12px; color: #6366f1; margin-top: 4px;">Visit us again soon for more delicious moments.</div>
          </div>
        </div>
        <div class="footer">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Odoo Cafeteria. All rights reserved.</p>
          <p style="margin: 4px 0 0;">This is an automated receipt. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email: recipientEmail }],
        subject: `Your Odoo Cafeteria Receipt - Order #${order.orderNumber}`,
        htmlContent: emailHtml,
      },
      {
        headers: {
          "api-key": BREVO_API_KEY,
          "content-type": "application/json",
        },
      },
    );
    console.log("✅ Receipt sent to", recipientEmail, response.data.messageId);
  } catch (error) {
    console.error(
      "❌ Failed to send receipt to",
      recipientEmail,
      error.response?.data || error.message,
    );
  }
};
