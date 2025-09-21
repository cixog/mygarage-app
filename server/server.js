// server/server.js

import mongoose from 'mongoose';
import app from './app.js';
import { initEmailClient } from './utils/email.js';

// Initialize the email client once at application startup.
// This sets the email client based on the NODE_ENV.
const sendEmail = initEmailClient();

// Handle any uncaught exceptions at the very top
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

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

// We need to export this, but server.js is the entry point, so we can't directly export.
// A cleaner way is to store it and retrieve it from another file, but for a quick fix, let's pass it.
// This approach is not ideal, but it's a minimal change to get your app working.
app.set('emailClient', sendEmail);
