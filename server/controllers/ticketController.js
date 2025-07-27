// server/controllers/ticketController.js (Corrected with ES Modules)
import Ticket from '../models/ticketModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

// For the user submitting the Tool Box form
export const createTicket = catchAsync(async (req, res, next) => {
  const { category, subject, description } = req.body;
  const submittedBy = req.user.id; // From authController.protect

  if (!category || !subject || !description) {
    return next(new AppError('Please fill out all fields.', 400));
  }

  await Ticket.create({ category, subject, description, submittedBy });

  res.status(201).json({
    status: 'success',
    message:
      'Your request has been received! We will get back to you when able.',
  });
});

// For the admin to view all submitted tickets
export const getAllTickets = catchAsync(async (req, res, next) => {
  const tickets = await Ticket.find()
    .populate('submittedBy', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    data: {
      tickets,
    },
  });
});

// For the admin to change the status of a ticket
export const updateTicketStatus = catchAsync(async (req, res, next) => {
  const ticket = await Ticket.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  );

  if (!ticket) {
    return next(new AppError('No ticket found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      ticket,
    },
  });
});
