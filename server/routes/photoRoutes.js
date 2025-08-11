// server/routes/photoRoutes.js (Corrected with ES Modules)
import express from 'express';
import * as photoController from '../controllers/photoController.js';
import * as authController from '../controllers/authController.js';
import commentRouter from './commentRoutes.js';

const router = express.Router();

// Nested route: Any request to /api/v1/photos/:photoId/comments will be handled by commentRouter
router.use('/:photoId/comments', commentRouter);

// --- PUBLIC ROUTE ---
// Anyone can view the main photo feed.
router.get('/', photoController.getAllPhotos);

// --- GATEKEEPER ---
// All routes below are protected and require a logged-in user.
router.use(authController.protect);

// --- PROTECTED ROUTES ---
// Get the feed of photos from users the current user follows.
router.get('/feed', photoController.getFeedPhotos);

// Route for uploading new photos for a vehicle.
router.post(
  '/upload',
  photoController.uploadVehiclePhotos,
  photoController.createPhoto
);

// Route for liking/unliking a photo.
router.patch('/:id/like', photoController.toggleLike);

// Routes for getting, updating (e.g., caption), or deleting a specific photo.
router
  .route('/:id')
  .get(photoController.getPhoto)
  .patch(photoController.updatePhoto)
  .delete(photoController.deletePhoto);

export default router;
