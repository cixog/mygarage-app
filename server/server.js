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
const DB = process.env.DATABASE;

// Check if the DATABASE variable is even being loaded by Render
if (!DB) {
  console.error('FATAL ERROR: DATABASE environment variable not found!');
  process.exit(1); // Stop the server if the connection string is missing
}

console.log('Attempting to connect to MongoDB Atlas...');
console.log(
  `(Using connection string starting with: ${DB.substring(0, 25)}...)`
); // Log a snippet for verification

mongoose
  .connect(DB)
  .then(() => console.log('✅ DB connection successful!')) // <-- SUCCESS MESSAGE
  .catch(err => {
    // <-- FAILURE MESSAGE
    console.error('❌ DB Connection Error:', err.message);
    // Add a more detailed reason for common errors
    if (err.name === 'MongoNetworkError') {
      console.error(
        'Hint: This often means a firewall or IP whitelist issue in MongoDB Atlas.'
      );
    }
    if (err.name === 'MongooseServerSelectionError') {
      console.error(
        'Hint: Check your connection string, password, and IP whitelist.'
      );
    }
  });
// --- END OF TEST SECTION ---

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
