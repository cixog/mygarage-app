// server/routes/userRoutes.js (Corrected with ES Modules)
import express from 'express';
import * as userController from '../controllers/userController.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// --- PUBLIC ROUTES ---
// Anyone can sign up or log in.
router.post('/signup', authController.signup);
router.post('/login', authController.login);
// **FIX**: This route now correctly points to the `verifyEmail` controller
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// --- GATEKEEPER ---
// All routes below this require a user to be logged in.
router.use(authController.protect);

// --- LOGGED-IN USER ROUTES (acting on their own account) ---
router.get('/me/followed-garages', userController.getFollowedGarages);
router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser); // Special route to get current user
router.patch(
  '/updateMe',
  userController.uploadUserAvatar,
  userController.resizeUserAvatar,
  userController.updateMe
);

router.post(
  '/complete-onboarding',
  userController.uploadUserAvatar, // We can reuse the avatar upload middleware
  userController.resizeUserAvatar, // and the resize middleware
  userController.completeOnboarding // This is the new controller function we will create
);

router.delete('/deleteMe', userController.deleteMe);

// Follow/unfollow routes
router.post('/follow/:id', userController.follow);
router.post('/unfollow/:id', userController.unfollow);

// --- ADMIN-ONLY ROUTES ---
// The user must be logged in AND have the 'admin' role.
router.use(authController.restrictTo('admin'));

router.route('/').get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
