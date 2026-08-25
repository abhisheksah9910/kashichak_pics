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
    subject: 'Verify your email - Apna Kashichak',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px;">
        <h1 style="color: #c2410c;">Apna Kashichak</h1>

        <h2>Hello ${name} 👋</h2>

        <p>Thank you for signing up with Apna Kashichak.</p>

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

        <p>Regards,<br /><strong>Apna Kashichak Team</strong></p>
      </div>
    `,
  });
};

module.exports = {
  sendOTPEmail,
};