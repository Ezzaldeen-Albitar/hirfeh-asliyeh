import nodemailer from 'nodemailer';
const createTransporter = () =>
    nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f0eb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #92400e, #b45309); padding: 30px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 28px; letter-spacing: 1px; }
    .header p { color: #fde68a; margin: 8px 0 0; font-size: 14px; }
    .body { padding: 40px 30px; }
    .otp-box { background: #fef3c7; border: 2px dashed #f59e0b; border-radius: 12px; text-align: center; padding: 30px; margin: 25px 0; }
    .otp-code { font-size: 48px; font-weight: bold; letter-spacing: 12px; color: #92400e; font-family: monospace; }
    .otp-note { color: #6b7280; font-size: 13px; margin-top: 10px; }
    .footer { background: #f9f5f0; padding: 20px 30px; text-align: center; color: #9ca3af; font-size: 12px; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 25px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Hirfeh Asliyeh</h1>
      <p>Authentic Jordanian Crafts Marketplace</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Hirfeh Asliyeh. All rights reserved.</p>
      <p>This is an automated email, please do not reply.</p>
    </div>
  </div>
</body>
</html>`;

const otpVerifyTemplate = (name, otp) => baseTemplate(`
  <h2 style="color:#1f2937;">Welcome, ${name}!</h2>
  <p style="color:#4b5563;">Thank you for joining Hirfeh Asliyeh. To verify your email address, please use the following code:</p>
  <div class="otp-box">
    <div class="otp-code">${otp}</div>
    <p class="otp-note">⏱ Valid for 10 minutes only</p>
  </div>
  <hr class="divider" />
  <p style="color:#6b7280; font-size:13px;">If you did not request this code, you can safely ignore this email.</p>
`);

const otpResetTemplate = (name, otp) => baseTemplate(`
  <h2 style="color:#1f2937;">Password Reset</h2>
  <p style="color:#4b5563;">Hello ${name}, we received a request to reset your account password.</p>
  <div class="otp-box">
    <div class="otp-code">${otp}</div>
    <p class="otp-note">⏱ Valid for 10 minutes only</p>
  </div>
  <hr class="divider" />
  <p style="color:#6b7280; font-size:13px;">If you did not request a reset, please ignore this email. Your account is secure.</p>
`);

const orderConfirmTemplate = (name, orderNumber, total) => baseTemplate(`
  <h2 style="color:#1f2937;">Order Confirmation </h2>
  <p style="color:#4b5563;">Hello ${name}, thank you for your order from Hirfeh Asliyeh!</p>
  <div style="background:#f0fdf4; border-radius:8px; padding:20px; margin:20px 0; text-align:center;">
    <p style="color:#6b7280; margin:0 0 8px;">Order Number</p>
    <p style="font-size:24px; font-weight:bold; color:#166534; margin:0;">${orderNumber}</p>
    <p style="color:#6b7280; margin:8px 0 0;">Total Amount: ${total} JOD</p>
  </div>
  <p style="color:#4b5563;">We will notify you of any order updates via email and in-app notifications.</p>
`);

const artisanVerifiedTemplate = (name) => baseTemplate(`
  <h2 style="color:#1f2937;">Congratulations! Account Verified</h2>
  <p style="color:#4b5563;">Hello ${name},</p>
  <p style="color:#4b5563;">We are pleased to inform you that Hirfeh Asliyeh has approved your store verification. You are now a verified artisan!</p>
  <div style="text-align:center; margin:25px 0;">
    <p style="font-weight:bold; color:#92400e; margin-top:10px;">Verified Artisan</p>
  </div>
  <p style="color:#4b5563;">You can now upload products, add origin stories, and manage your full shop.</p>
`);

export async function sendOTPEmail(to, name, otp) {
    const transporter = createTransporter();
    await transporter.sendMail({
        from: `"Hirfeh Asliyeh " <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Verification Code — Hirfeh Asliyeh',
        html: otpVerifyTemplate(name, otp),
    });
}

export async function sendPasswordResetEmail(to, name, otp) {
    const transporter = createTransporter();
    await transporter.sendMail({
        from: `"Hirfeh Asliyeh " <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Password Reset — Hirfeh Asliyeh',
        html: otpResetTemplate(name, otp),
    });
}

export async function sendOrderConfirmationEmail(to, name, orderNumber, total) {
    const transporter = createTransporter();
    await transporter.sendMail({
        from: `"Hirfeh Asliyeh " <${process.env.EMAIL_USER}>`,
        to,
        subject: `Order Confirmation #${orderNumber} — Hirfeh Asliyeh`,
        html: orderConfirmTemplate(name, orderNumber, total),
    });
}

export async function sendArtisanVerifiedEmail(to, name) {
    const transporter = createTransporter();
    await transporter.sendMail({
        from: `"Hirfeh Asliyeh " <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Account Verified — Hirfeh Asliyeh',
        html: artisanVerifiedTemplate(name),
    });
}