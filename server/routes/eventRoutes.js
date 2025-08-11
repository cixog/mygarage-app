// server/routes/eventRoutes.js (Final Version with Cloudinary)
import express from 'express';
import * as eventController from '../controllers/eventController.js';
import * as authController from '../controllers/authController.js';

// We import the single, correct upload middleware from photoController.
// Even though it's named 'uploadVehiclePhotos', it's a generic Cloudinary uploader
// that works perfectly for the single event image.
import { uploadVehiclePhotos } from '../controllers/photoController.js';

const router = express.Router();

// --- PUBLIC ROUTES ---
// Anyone can view the list of approved events or a single event's detail page.
router.get('/', eventController.getAllPublicEvents);
router.get('/:id', eventController.getPublicEvent);

// --- GATEKEEPER ---
// All routes below this point require the user to be logged in.
router.use(authController.protect);

// --- PROTECTED ROUTE (Require Login) ---
// This is the route for submitting a new event for review.
router.post(
  '/submit',

  // --- THIS IS THE FIX ---
  // 1. Use the new Cloudinary upload middleware. It handles the file upload first.
  // 2. We have removed the old `resizeUserPhoto` middleware, which no longer exists.
  uploadVehiclePhotos,

  // 3. After the file is handled, the request is passed to the main controller function.
  eventController.submitEvent
  // --- END OF FIX ---
);

// --- ADMIN-ONLY ROUTES (Require Login + Admin Role) ---
// All routes below this point require the user to be an admin.
router.use(authController.restrictTo('admin'));

router.get('/admin/pending', eventController.getPendingEvents);
router.patch('/admin/:id/approve', eventController.approveEvent);
router.patch('/admin/:id/reject', eventController.rejectEvent);

// Standard admin CRUD operations
router
  .route('/:id')
  .patch(eventController.updateEvent)
  .delete(eventController.deleteEvent);

export default router;
