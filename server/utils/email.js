import nodemailer from 'nodemailer';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Initialize the SES Client once at the top of the module.
const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Logic for sending emails via AWS SES (for production)
const sendEmailSES = async options => {
  // Check for required AWS environment variables
  if (
    !process.env.AWS_REGION ||
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY
  ) {
    console.error(
      'AWS SES environment variables are missing. Please check your configuration.'
    );
    throw new Error('AWS SES credentials not configured.');
  }

  const params = {
    Source: process.env.AWS_FROM_EMAIL,
    Destination: {
      ToAddresses: [options.email],
    },
    Message: {
      Subject: {
        Data: options.subject,
      },
      Body: {
        Html: {
          Data: options.html,
        },
        Text: {
          Data: options.text,
        },
      },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    console.log('Email sent successfully via AWS SES.');
  } catch (error) {
    console.error('Error sending email via AWS SES:', error);
    throw new Error('There was an error sending the email.');
  }
};

// Logic for sending emails via Mailtrap (for development)
const sendEmailMailtrap = async options => {
  // Check for required Mailtrap environment variables
  if (
    !process.env.EMAIL_HOST ||
    !process.env.EMAIL_PORT ||
    !process.env.EMAIL_USERNAME ||
    !process.env.EMAIL_PASSWORD
  ) {
    console.error(
      'Mailtrap environment variables are missing. Please check your .env file.'
    );
    throw new Error('Mailtrap credentials not configured.');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `Your App <${process.env.EMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
    text: options.text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully via Mailtrap.');
  } catch (error) {
    console.error('Error sending email via Mailtrap:', error);
    throw new Error('There was an error sending the email.');
  }
};

// Main function that exports the correct email service based on the environment
const sendEmail = async options => {
  if (process.env.NODE_ENV === 'production') {
    return sendEmailSES(options);
  } else {
    return sendEmailMailtrap(options);
  }
};

export default sendEmail;
