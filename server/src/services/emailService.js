import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure env is loaded (fallback if not already loaded by index.js)
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send Workspace Invitation Email
 */
export const sendInvitationEmail = async (toEmail, workspaceName, inviteLink) => {
  const mailOptions = {
    from: `"DailyTM" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `You've been invited to join ${workspaceName} on DailyTM`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1; margin: 0;">DailyTM</h1>
          <p style="color: #666; font-size: 16px;">Collaborate. Track. Succeed.</p>
        </div>
        
        <div style="background: #f8fafc; border-radius: 12px; padding: 30px; border: 1px solid #e2e8f0;">
          <h2 style="margin-top: 0; color: #1e293b;">Workspace Invitation</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #475569;">
            Hello! You have been invited to collaborate in the <strong>${workspaceName}</strong> workspace on DailyTM.
          </p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${inviteLink}" style="background-color: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
              Join Workspace
            </a>
          </div>
          
          <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">
            Or copy and paste this link into your browser:<br/>
            <span style="word-break: break-all; color: #6366f1;">${inviteLink}</span>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px;">
          <p>&copy; 2026 DailyTM Task Management. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: ", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending invitation email:", error);
    throw error;
  }
};

/**
 * Send Test Connection Email
 */
export const sendTestEmail = async () => {
  const mailOptions = {
    from: `"DailyTM Diagnostics" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: "DailyTM - SMTP Diagnostic Test",
    text: "This is a test email from your DailyTM server. If you are reading this, your Gmail SMTP connection (Nodemailer) is working correctly!",
    html: "<b>DailyTM Diagnostic</b><p>Your Gmail SMTP connection is working correctly! You can now send real workspace invitations.</p>",
  };

  return await transporter.sendMail(mailOptions);
};
