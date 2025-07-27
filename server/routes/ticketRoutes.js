// server/routes/ticketRoutes.js (Corrected with ES Modules)
import express from 'express';
import * as ticketController from '../controllers/ticketController.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// --- GATEKEEPER ---
// All routes in this file require a user to be logged in.
router.use(authController.protect);

// --- USER ROUTE ---
// Route for a user to submit a ticket from the "Tool Box" page
router.post('/submit', ticketController.createTicket);

// --- ADMIN-ONLY ROUTES ---
// The user must also have the 'admin' role for the routes below.
router.use(authController.restrictTo('admin'));

router.route('/').get(ticketController.getAllTickets);

router.route('/:id/status').patch(ticketController.updateTicketStatus);

export default router;
