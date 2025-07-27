// server/routes/reviewRoutes.js (Corrected with ES Modules)
import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import * as authController from '../controllers/authController.js';

// mergeParams is necessary to get access to params from parent routers (like :garageId)
const router = express.Router({ mergeParams: true });

// --- PUBLIC ROUTES ---
// Anyone can get all reviews for a garage or a single review by its ID.
router.route('/').get(reviewController.getAllReviews);

router.route('/:id').get(reviewController.getReview);

// --- GATEKEEPER ---
// All routes below this point require the user to be logged in.
router.use(authController.protect);

// --- PROTECTED ROUTES ---
// Only a logged-in user can create a review.
router
  .route('/')
  .post(
    authController.restrictTo('user'),
    reviewController.setGarageUserIds,
    reviewController.createReview
  );

// Only the user who wrote the review or an admin can update/delete it.
router
  .route('/:id')
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

export default router;
