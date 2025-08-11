// server/routes/userRoutes.js
import express from 'express';
import * as userController from '../controllers/userController.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// --- GATEKEEPER ---
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  userController.uploadUserAvatar, // Use the single Cloudinary middleware
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

router.post(
  '/complete-onboarding',
  userController.uploadUserAvatar, // Use the single Cloudinary middleware
  userController.completeOnboarding
);

router.post('/follow/:id', userController.follow);
router.post('/unfollow/:id', userController.unfollow);

router.get('/me/followed-garages', userController.getFollowedGarages);

// --- ADMIN-ONLY ROUTES ---
router.use(authController.restrictTo('admin'));

router.route('/').get(userController.getAllUsers);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
