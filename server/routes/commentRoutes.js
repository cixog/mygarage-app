// server/routes/commentRoutes.js (Corrected with ES Modules)
import express from 'express';

// Import all exported functions from the controller files
import * as commentController from '../controllers/commentController.js';
import * as authController from '../controllers/authController.js';

// CRITICAL: mergeParams must be true to get :vehicleId from the parent router
const router = express.Router({ mergeParams: true });

// --- PUBLIC ROUTE ---
router.route('/').get(commentController.getAllComments);

router.route('/:id').get(commentController.getComment);

// --- GATEKEEPER ---
router.use(authController.protect);

// --- PROTECTED ROUTES ---
router.route('/').post(
  authController.restrictTo('user', 'moderator', 'admin', 'superadmin'),
  commentController.setVehicleUserIds, // Use the new middleware
  commentController.createComment
);

router.patch('/:id/like', commentController.toggleLike);

router
  .route('/:id')
  .patch(
    authController.restrictTo('user', 'admin'),
    commentController.updateComment
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    commentController.deleteComment
  );

export default router;
