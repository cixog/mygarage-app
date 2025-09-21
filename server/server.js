// server/server.js
import mongoose from 'mongoose';
//import dotenv from 'dotenv';
import app from './app.js';

// Load environment variables from config.env
//dotenv.config({ path: './config.env' });

// Now, after dotenv has loaded the variables, initialize the email client.
import { initEmailClient } from './utils/email.js';
const sendEmail = initEmailClient();

// Handle any uncaught exceptions at the very top
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

console.log('Environment from config:', process.env.NODE_ENV);
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'production') {
  process.env.NODE_ENV = 'development';
}
console.log('Final NODE_ENV:', process.env.NODE_ENV);

const DB = process.env.DATABASE;

if (!DB) {
  console.error('FATAL ERROR: DATABASE environment variable not found!');
  process.exit(1);
}

mongoose
  .connect(DB)
  .then(conn => {
    console.log(
      `✅ DB connection successful to database: ${conn.connection.name}`
    );
  })
  .catch(err => {
    console.error('❌ DB Connection Error:', err.message);
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
