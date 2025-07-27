// server/routes/garageRoutes.js (Corrected with ES Modules)
import express from 'express';
import * as garageController from '../controllers/garageController.js';
import * as authController from '../controllers/authController.js';
import reviewRouter from './reviewRoutes.js'; // This is a nested router

const router = express.Router();

// --- Nested Route for Reviews ---
// Any request to /garages/:garageId/reviews will be handled by the reviewRouter
router.use('/:garageId/reviews', reviewRouter);

// --- Public Routes ---
router.route('/').get(garageController.getAllGarages);

router.route('/:id').get(garageController.getGarage);

// --- Protected Routes (User must be logged in) ---
router.use(authController.protect);

router
  .route('/my-garage')
  .post(garageController.createMyGarage)
  .patch(garageController.updateMyGarage)
  .delete(garageController.deleteMyGarage);

// --- Admin-Only Routes ---
router
  .route('/:id')
  .patch(authController.restrictTo('admin'), garageController.updateGarage)
  .delete(authController.restrictTo('admin'), garageController.deleteGarage);

export default router;
