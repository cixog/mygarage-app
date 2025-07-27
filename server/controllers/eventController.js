// server/controllers/eventController.js
import Event from '../models/eventModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import * as factory from './handlerFactory.js';
import sendEmail from '../utils/email.js'; // For sending notifications
import APIFeatures from '../utils/apiFeatures.js';

// FOR USERS: Submit an event for review
export const submitEvent = catchAsync(async (req, res, next) => {
  // All fields from the form
  const {
    title,
    category,
    shortDescription,
    fullDescription,
    startDate,
    endDate,
    location,
  } = req.body;

  const eventData = {
    title,
    category,
    shortDescription,
    fullDescription,
    startDate,
    endDate,
    location,
    createdBy: req.user.id,
    submittedAt: Date.now(),
    // Defaults from schema will set status to 'pending' and approved to 'false'
  };

  // Handle the uploaded image if it exists
  if (req.body.photos && req.body.photos.length > 0) {
    eventData.image = req.body.photos[0];
  }

  const newEvent = await Event.create(eventData);

  res.status(201).json({
    status: 'success',
    data: {
      event: newEvent,
    },
  });
});

// THIS IS THE FIX: Only get approved, upcoming events
export const getAllPublicEvents = catchAsync(async (req, res, next) => {
  const today = new Date();

  // We now correctly instantiate the APIFeatures class directly.
  const features = new APIFeatures(
    Event.find({
      approved: true,
      endDate: { $gte: today },
    }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const events = await features.query;

  res.status(200).json({
    status: 'success',
    results: events.length,
    data: {
      data: events,
    },
  });
});

// FOR PUBLIC: Get details of a single approved event
export const getPublicEvent = factory.getOne(Event);

// --- ADMIN FUNCTIONS ---

// Get all events regardless of status for the admin panel
export const getAllEvents = factory.getAll(Event);
export const updateEvent = factory.updateOne(Event);
export const deleteEvent = factory.deleteOne(Event);

// Get only events with a 'pending' status for the admin review queue
export const getPendingEvents = catchAsync(async (req, res, next) => {
  const pendingEvents = await Event.find({ status: 'pending' }).sort({
    submittedAt: 1,
  });

  res.status(200).json({
    status: 'success',
    results: pendingEvents.length,
    data: {
      data: pendingEvents,
    },
  });
});

// Approve an event
export const approveEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    {
      approved: true,
      status: 'approved',
      reviewedAt: Date.now(),
    },
    { new: true, runValidators: true }
  ).populate('createdBy');

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  // Optional: Notify user of approval
  try {
    await sendEmail({
      email: event.createdBy.email,
      subject: `Your Event Submission: "${event.title}" has been Approved!`,
      message: `Great news! Your event, "${event.title}", has been approved and is now live on MyGarage.`,
    });
  } catch (err) {
    console.error('Failed to send approval email:', err);
  }

  res.status(200).json({ status: 'success', message: 'Event approved.' });
});

// Reject an event
export const rejectEvent = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected', rejectionReason: reason, reviewedAt: Date.now() },
    { new: true }
  ).populate('createdBy');

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  // Optional: Notify user of approval
  try {
    await sendEmail({
      email: event.createdBy.email,
      subject: `Your Event Submission: "${event.title}" has been Approved!`,
      message: `Great news! Your event, "${event.title}", has been approved and is now live on MyGarage.`,
    });
  } catch (err) {
    console.error('Failed to send approval email:', err);
  }

  res.status(200).json({ status: 'success', message: 'Event rejected.' });
});
