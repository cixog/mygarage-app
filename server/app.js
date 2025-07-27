// server/app.js (FINAL, with Manual Header Override)
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import AppError from './utils/AppError.js';
import globalErrorHandler from './controllers/errorController.js';
import garageRouter from './routes/garageRoutes.js';
import userRouter from './routes/userRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import photoRouter from './routes/photoRoutes.js';
import vehicleRouter from './routes/vehicleRoutes.js';
import searchRouter from './routes/searchRoutes.js';
import eventRouter from './routes/eventRoutes.js';
import ticketRouter from './routes/ticketRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. GLOBAL MIDDLEWARE
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

// We still use helmet for general security, but we will override its resource policy.
app.use(helmet());

// --- THIS IS THE DEFINITIVE FIX ---
// This custom middleware manually sets the Cross-Origin-Resource-Policy header.
// It will force the browser to allow your frontend to display the images.
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});
// --- END OF FIX ---

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

// 2. SERVE STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

// 3. API ROUTES
app.use('/api/v1/garages', garageRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/photos', photoRouter);
app.use('/api/v1/vehicles', vehicleRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/events', eventRouter);
app.use('/api/v1/tickets', ticketRouter);

// 4. REACT APP SERVING & 404 HANDLER
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
}

app.all('/api/*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 5. GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

export default app;
