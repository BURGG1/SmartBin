const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const sendPasswordEmail = async ({ to, fullname, password }) => {
  await transporter.sendMail({
    from: `"Smart Waste Management" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Your Household Account Credentials",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #16a34a;">Welcome, ${fullname}!</h2>
        <p>Your household has been successfully registered in the <strong>Smart Waste Management System</strong>.</p>
        <p>Here are your login credentials:</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>Email:</strong> ${to}</p>
          <p style="margin: 8px 0 0;"><strong>Password:</strong> <span style="font-size: 18px; color: #16a34a; font-weight: bold;">${password}</span></p>
        </div>
        <p style="color: #6b7280; font-size: 13px;">Please keep your password safe. You can change it after logging in.</p>
      </div>
    `,
  });
};

module.exports = { sendPasswordEmail };