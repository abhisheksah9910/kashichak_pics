const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendOTPEmail = async (email, name, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify your email - Kashichak',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px;">
        <h1 style="color: #c2410c;">Kashichak</h1>

        <h2>Hello ${name} 👋</h2>

        <p>Thank you for signing up with Kashichak.</p>

        <p>Your email verification OTP is:</p>

        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          text-align: center;
          padding: 20px;
          background: #fff7ed;
          border-radius: 10px;
          color: #c2410c;
        ">
          ${otp}
        </div>

        <p>This OTP will expire in <strong>10 minutes</strong>.</p>

        <p>If you did not create this account, please ignore this email.</p>

        <br />

        <p>Regards,<br /><strong>Kashichak Team</strong></p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (email, name, resetUrl) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Reset your password - Kashichak',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px;">
        <h1 style="color: #c2410c;">Kashichak</h1>

        <h2>Hello ${name},</h2>

        <p>You requested a password reset for your Kashichak account.</p>

        <p>Please click the button below to reset your password:</p>

        <a href="${resetUrl}" style="
          display: inline-block;
          padding: 10px 20px;
          margin: 20px 0;
          background-color: #c2410c;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        ">
          Reset Password
        </a>

        <p>This link will expire in <strong>1 hour</strong>.</p>

        <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>

        <br />

        <p>Regards,<br /><strong>Kashichak Team</strong></p>
      </div>
    `,
  });
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetEmail,
};