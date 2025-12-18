import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: parseInt(process.env.SMTP_PORT || '587'),
//   secure: false, // true for 465, false for other ports
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,  // your gmail address
    pass: process.env.SMTP_PASS,  // your app password
  },
    tls: {
    // ⚠️ DEV ONLY: accept self-signed certs
    rejectUnauthorized: false,
  },
});

export const sendOtpEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: '"Tradovate Admin" <' + process.env.SMTP_USER + '>',
    to: email,
    subject: 'Your Login OTP',
    text: `Your OTP for login is: ${otp}. It expires in 10 minutes.`,
    html: `<b>Your OTP for login is: ${otp}</b><br>It expires in 10 minutes.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
