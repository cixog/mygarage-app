// server/server.js (Corrected Order)
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Handle uncaught exceptions at the very top
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// --- CRITICAL: Configure environment variables FIRST ---
dotenv.config({ path: './config.env' });

// Now that env variables are loaded, import the app
import app from './app.js';

// Connect to the database
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log('DB connection successful!'))
  .catch(err => console.error('DB Connection Error:', err));

// Start the server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Handle unhandled promise rejections (like a bad DB password)
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
