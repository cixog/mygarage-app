import nodemailer from 'nodemailer';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

let sesClient;
// This function will be called once on startup to determine the environment
const getEmailClient = () => {
  // Check for production-specific AWS credentials. This is the most reliable check.
  const isProduction =
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

  if (isProduction) {
    try {
      console.log('Attempting to initialize SES client in production mode.');

      sesClient = new SESClient({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
      console.log('SES client initialized for production.');

      // Return the production email function
      return async options => {
        const params = {
          Source: process.env.AWS_FROM_EMAIL,
          Destination: { ToAddresses: [options.email] },
          Message: {
            Subject: { Data: options.subject },
            Body: {
              Html: { Data: options.html },
              Text: { Data: options.text },
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
    } catch (error) {
      console.error('Failed to initialize AWS SES client:', error);
      // Fallback to development client if production fails to initialize
      return getDevelopmentEmailClient();
    }
  } else {
    // If not production, return the development client
    console.log('Using development email client (Mailtrap).');
    return getDevelopmentEmailClient();
  }
};

const getDevelopmentEmailClient = () => {
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

  return async options => {
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
};

// Main export that selects the correct client based on the environment
const sendEmail = getEmailClient();

export default sendEmail;
