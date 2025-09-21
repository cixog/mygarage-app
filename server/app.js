import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// Define a variable that reliably points to the 'server' directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use that reliable path to load your config file
dotenv.config({ path: path.resolve(__dirname, 'config.env') });

// Now your test logs should show the correct values.
console.log('--- Dotenv Load Test ---');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_USERNAME:', process.env.EMAIL_USERNAME);
console.log('------------------------');

//import AppError from './utils/AppError.js';
import globalErrorHandler from './controllers/errorController.js';
import garageRouter from './routes/garageRoutes.js';
import userRouter from './routes/userRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import photoRouter from './routes/photoRoutes.js';
import vehicleRouter from './routes/vehicleRoutes.js';
import searchRouter from './routes/searchRoutes.js';
import eventRouter from './routes/eventRoutes.js';
import ticketRouter from './routes/ticketRoutes.js';

const app = express();

// ✅ --- THIS IS THE FIX --- ✅
// Tell Express to trust the headers added by Render's reverse proxy.
// This is crucial for rate limiting and getting the user's real IP.
app.set('trust proxy', 1);

// --- THIS IS THE FIX ---
// The `cors` configuration is updated to allow both www and non-www domains.
// We check if the CLIENT_URL environment variable is set. If it is, we create
// an array containing both versions.
const allowedOrigins = [];
// --- THIS IS THE FIX ---
// Conditionally add the localhost URL if in a development environment.
if (process.env.NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:5173');
}

// Your existing production logic to handle CLIENT_URL and CORS_ORIGINS
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
  allowedOrigins.push(process.env.CLIENT_URL.replace('www.', ''));
}
if (process.env.CORS_ORIGINS) {
  process.env.CORS_ORIGINS.split(',').forEach(origin => {
    const trimmedOrigin = origin.trim();
    if (trimmedOrigin && !allowedOrigins.includes(trimmedOrigin)) {
      allowedOrigins.push(trimmedOrigin);
    }
  });
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// --- HELMET CSP CONFIGURATION FOR CLOUDINARY ---
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'script-src': ["'self'", 'api.mapbox.com'],
        'worker-src': ["'self'", 'blob:'],
        'img-src': ["'self'", 'data:', 'res.cloudinary.com', 'api.mapbox.com'],
        // This 'connect-src' line explicitly allows your frontend to fetch data
        // from your Render backend and Mapbox.
        'connect-src': [
          "'self'",
          'https://www.tourmygarage.com', // Your frontend domain
          'https://tourmygarage.com', // Your non-www frontend domain
          'https://mygarage-back-ccbs.onrender.com', // Your NEW backend domain
          'https://api.mapbox.com',
        ],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Try again in an hour!',
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

//app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/garages', garageRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/photos', photoRouter);
app.use('/api/v1/vehicles', vehicleRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/events', eventRouter);
app.use('/api/v1/tickets', ticketRouter);

// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../client/dist')));
//   app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
//   });
// }

// app.all('/api/*', (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

app.use(globalErrorHandler);

export default app;
