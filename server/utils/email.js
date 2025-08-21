// server/utils/email.js
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// 1. Initialize the SES Client with credentials from your environment variables
const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const sendEmail = async options => {
  // 2. Create the parameter object in the format AWS SES expects
  const params = {
    Source: process.env.AWS_FROM_EMAIL, // The 'from' address you verified
    Destination: {
      ToAddresses: [options.email], // The recipient's email
    },
    Message: {
      Subject: {
        Data: options.subject,
      },
      Body: {
        Html: {
          Data: options.html, // The HTML version of the email
        },
        Text: {
          Data: options.text, // The plain text version
        },
      },
    },
  };

  try {
    // 3. Create a new command and send it using the SES client
    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    console.log('Email sent successfully via AWS SES.');
  } catch (error) {
    console.error('Error sending email via AWS SES:', error);
    // Re-throw the error so the calling function knows it failed
    throw new Error('There was an error sending the email.');
  }
};

export default sendEmail;
