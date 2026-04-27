import nodemailer from "nodemailer";
import { config } from "../config/config.js";

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: Number(config.SMTP_PORT),
  secure: Number(config.SMTP_PORT) === 465,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});

interface BudgetAlertParams {
  to: string;
  userName: string;
  alertLevel: number;
  budgetAmount: number;
  spent: number;
  usagePercent: number;
  budgetType: string;
}

export const sendBudgetAlertEmail = async ({
  to,
  userName,
  alertLevel,
  budgetAmount,
  spent,
  usagePercent,
  budgetType,
}: BudgetAlertParams): Promise<void> => {
  const remaining = budgetAmount - spent;

  // Dynamic styling & messaging based on threshold
  const alertConfig: Record<
    number,
    { color: string; bgColor: string; emoji: string; title: string; message: string }
  > = {
    60: {
      color: "#f59e0b",
      bgColor: "#fef3c7",
      emoji: "⚠️",
      title: "Budget Warning: 60% Used",
      message: `You've used 60% of your ${budgetType.toLowerCase()} budget. Consider reviewing your spending to stay on track.`,
    },
    80: {
      color: "#f97316",
      bgColor: "#ffedd5",
      emoji: "🚨",
      title: "Budget Alert: 80% Used",
      message: `You've used 80% of your ${budgetType.toLowerCase()} budget. You're approaching your limit — try to reduce non-essential expenses.`,
    },
    100: {
      color: "#ef4444",
      bgColor: "#fee2e2",
      emoji: "🛑",
      title: "Budget Exceeded!",
      message: `You've reached or exceeded your ${budgetType.toLowerCase()} budget. Immediate attention is needed to manage your finances.`,
    },
  };

  const cfg = alertConfig[alertLevel] || alertConfig[60];

  const subject = `${cfg.emoji} ${cfg.title}`;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0; padding:0; background-color:#f4f4f5; font-family:'Segoe UI',Roboto,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding:32px 0;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg, ${cfg.color}, ${cfg.color}dd); padding:28px 32px;">
                <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:700;">
                  ${cfg.emoji} ${cfg.title}
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:28px 32px;">
                <p style="margin:0 0 16px; color:#374151; font-size:15px; line-height:1.6;">
                  Hi <strong>${userName}</strong>,
                </p>
                <p style="margin:0 0 24px; color:#374151; font-size:15px; line-height:1.6;">
                  ${cfg.message}
                </p>

                <!-- Alert Banner -->
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${cfg.bgColor}; border-left:4px solid ${cfg.color}; border-radius:8px; margin-bottom:24px;">
                  <tr>
                    <td style="padding:16px 20px;">
                      <p style="margin:0; color:${cfg.color}; font-size:24px; font-weight:800;">
                        ${usagePercent.toFixed(1)}% Used
                      </p>
                      <p style="margin:4px 0 0; color:#6b7280; font-size:13px;">
                        of your ${budgetType.toLowerCase()} budget
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Stats Grid -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                  <tr>
                    <td width="33%" style="padding:12px; background-color:#f9fafb; border-radius:8px; text-align:center;">
                      <p style="margin:0; color:#6b7280; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">Budget</p>
                      <p style="margin:4px 0 0; color:#111827; font-size:18px; font-weight:700;">₹${budgetAmount.toLocaleString()}</p>
                    </td>
                    <td width="4%"></td>
                    <td width="33%" style="padding:12px; background-color:#f9fafb; border-radius:8px; text-align:center;">
                      <p style="margin:0; color:#6b7280; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">Spent</p>
                      <p style="margin:4px 0 0; color:${cfg.color}; font-size:18px; font-weight:700;">₹${spent.toLocaleString()}</p>
                    </td>
                    <td width="4%"></td>
                    <td width="33%" style="padding:12px; background-color:#f9fafb; border-radius:8px; text-align:center;">
                      <p style="margin:0; color:#6b7280; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">Remaining</p>
                      <p style="margin:4px 0 0; color:${remaining >= 0 ? "#10b981" : "#ef4444"}; font-size:18px; font-weight:700;">₹${remaining.toLocaleString()}</p>
                    </td>
                  </tr>
                </table>

                <!-- Progress Bar -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                  <tr>
                    <td>
                      <div style="background-color:#e5e7eb; border-radius:999px; height:10px; overflow:hidden;">
                        <div style="background-color:${cfg.color}; height:10px; width:${Math.min(usagePercent, 100)}%; border-radius:999px;"></div>
                      </div>
                    </td>
                  </tr>
                </table>

                <p style="margin:0; color:#9ca3af; font-size:13px; line-height:1.5;">
                  This is an automated alert from your Expense Tracker. Review your transactions to stay within budget.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px 32px; background-color:#f9fafb; border-top:1px solid #e5e7eb;">
                <p style="margin:0; color:#9ca3af; font-size:12px; text-align:center;">
                  © ${new Date().getFullYear()} Expense Tracker &bull; Budget Alert Notification
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  await transporter.sendMail({
    from: `"Expense Tracker" <${config.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};
