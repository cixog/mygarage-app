// server/routes/eventRoutes.js
import express from 'express';
import * as eventController from '../controllers/eventController.js';
import * as authController from '../controllers/authController.js';
import * as photoController from '../controllers/photoController.js';

const router = express.Router();

// --- Public Routes ---
router.get('/', eventController.getAllPublicEvents); // <-- Use the corrected function
router.get('/:id', eventController.getPublicEvent);

// --- GATEKEEPER ---
router.use(authController.protect);

// --- Protected Routes (Require Login) ---
router.post(
  '/submit',
  photoController.uploadUserPhoto,
  photoController.resizeUserPhoto,
  eventController.submitEvent
);

// --- Admin-Only Routes (Require Login + Admin Role) ---
router.use(authController.restrictTo('admin'));

router.get('/admin/pending', eventController.getPendingEvents);
router.patch('/admin/:id/approve', eventController.approveEvent);
router.patch('/admin/:id/reject', eventController.rejectEvent);

// ... other admin routes
export default router;
