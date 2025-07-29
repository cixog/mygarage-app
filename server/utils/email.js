// server/utils/email.js (Corrected with ES Modules)
import nodemailer from 'nodemailer';

const sendEmail = async options => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'MyGarage Admin <admin@mygarage.io>',
    to: options.email,
    subject: options.subject,
    // --- THIS IS THE CHANGE ---
    text: options.text, // The plain text version of the message
    html: options.html, // The HTML version of the message
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
