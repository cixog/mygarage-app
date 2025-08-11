// server/server.js (Correct and Final Version)
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Handle any uncaught exceptions at the very top
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Load environment variables from config.env
dotenv.config({ path: './config.env' });

// --- THIS IS THE KEY IMPORT ---
// This file correctly imports `app.js` using a relative path.
// It does NOT import any controllers.
import app from './app.js';

// Get the database connection string from the environment
const DB = process.env.DATABASE;

// Check if the DATABASE variable exists
if (!DB) {
  console.error('FATAL ERROR: DATABASE environment variable not found!');
  process.exit(1); // Stop the server if the connection string is missing
}

// Connect to MongoDB and log the result for diagnostics
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

// Start the Express server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Handle any unhandled promise rejections (like a bad DB password)
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
