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
    subject: 'अपना ईमेल वेरीफाई करें - Kashichak',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px;">
        <h1 style="color: #c2410c;">Kashichak</h1>

        <h2>नमस्ते ${name} 👋</h2>

        <p>Kashichak के साथ जुड़ने के लिए धन्यवाद।</p>

        <p>आपका ईमेल वेरिफिकेशन OTP है:</p>

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

        <p>यह OTP <strong>10 मिनट</strong> में एक्सपायर हो जाएगा।</p>

        <p>अगर आपने यह अकाउंट नहीं बनाया है, तो कृपया इस ईमेल को अनदेखा करें।</p>

        <br />

        <p>धन्यवाद,<br /><strong>Kashichak Team</strong></p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (email, name, resetUrl) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'अपना पासवर्ड रीसेट करें - Kashichak',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px;">
        <h1 style="color: #c2410c;">Kashichak</h1>

        <h2>नमस्ते ${name},</h2>

        <p>आपने अपने Kashichak अकाउंट का पासवर्ड रीसेट करने का अनुरोध किया है।</p>

        <p>कृपया अपना पासवर्ड रीसेट करने के लिए नीचे दिए गए बटन पर क्लिक करें:</p>

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
          पासवर्ड रीसेट करें
        </a>

        <p>यह लिंक <strong>1 घंटे</strong> में एक्सपायर हो जाएगा।</p>

        <p>अगर आपने पासवर्ड रीसेट करने का अनुरोध नहीं किया था, तो कृपया इस ईमेल को अनदेखा करें या हमारे सपोर्ट से संपर्क करें।</p>

        <br />

        <p>धन्यवाद,<br /><strong>Kashichak Team</strong></p>
      </div>
    `,
  });
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetEmail,
};