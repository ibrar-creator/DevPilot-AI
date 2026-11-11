import transporter from "../config/mail.js";
import { env } from "../config/env.js";

export const sendVerificationEmail = async (user, token) => {
  const verificationUrl =
    `${env.EMAIL_VERIFY_URL}?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: user.email,
    subject: "Verify your DevPilot AI account",
    text: `Hello ${user.name}, verify your email using this link: ${verificationUrl}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto">
        <h2>Welcome to DevPilot AI!</h2>
        <p>Hello ${user.name},</p>
        <p>Please verify your email address to activate your account.</p>
        <a href="${verificationUrl}"
           style="display:inline-block;padding:12px 20px;background:#111;color:#fff;text-decoration:none;border-radius:6px">
          Verify Email
        </a>
        <p>This link expires in 15 minutes.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (user, token) => {
  const resetUrl =
    `${env.PASSWORD_RESET_URL}?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: user.email,
    subject: "Reset your DevPilot AI password",
    text: `Reset your password using this link: ${resetUrl}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto">
        <h2>Password Reset</h2>
        <p>Hello ${user.name},</p>
        <p>Click below to reset your password.</p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:12px 20px;background:#111;color:#fff;text-decoration:none;border-radius:6px">
          Reset Password
        </a>
        <p>This link expires in 15 minutes.</p>
        <p>If you did not request this, ignore this email.</p>
      </div>
    `,
  });
};