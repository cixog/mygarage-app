// server/controllers/eventController.js (Final Version with Cloudinary)
import Event from '../models/eventModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import * as factory from './handlerFactory.js';
import sendEmail from '../utils/email.js';
import APIFeatures from '../utils/apiFeatures.js';
import geocode from '../utils/geocoder.js';

// FOR USERS: Submit an event for review
export const submitEvent = catchAsync(async (req, res, next) => {
  // All text fields from the form
  const {
    title,
    category,
    shortDescription,
    fullDescription,
    startDate,
    endDate,
    address, // New field
    city, // New field
    state, // New field
    url,
  } = req.body;

  // Construct a full address string for geocoding
  const fullAddressForGeocoding = [address, city, state]
    .filter(Boolean)
    .join(', ');

  let coordinates;
  try {
    const [longitude, latitude] = await geocode(fullAddressForGeocoding);
    coordinates = [longitude, latitude];
  } catch (err) {
    // It's better to let them submit without coordinates than to fail completely.
    // You can decide if you want to make this a hard requirement.
    console.warn(`Could not geocode address: ${fullAddressForGeocoding}`);
  }

  const eventData = {
    title,
    category,
    shortDescription,
    fullDescription,
    startDate,
    endDate,
    location: {
      address,
      city,
      state,
      coordinates,
    },
    url,
    createdBy: req.user.id,
    submittedAt: Date.now(),
  };

  // --- THIS IS THE FIX ---
  // The Cloudinary upload middleware places uploaded file information into `req.files`.
  // We check if a file was uploaded, and if so, we get its permanent URL
  // from the `path` property and save it to the database.
  if (req.files && req.files.length > 0) {
    // We assume an event only has one main image, so we take the first one.
    eventData.image = req.files[0].path;
  }
  // --- END OF FIX ---

  const newEvent = await Event.create(eventData);

  res.status(201).json({
    status: 'success',
    data: {
      event: newEvent,
    },
  });
});

// THIS FUNCTION IS UNCHANGED (Already Correct)
// It only gets approved, upcoming events for the public list
export const getAllPublicEvents = catchAsync(async (req, res, next) => {
  const today = new Date();

  // ✅ THIS IS THE FIX ✅
  // If no sort order is specified in the URL, default to sorting by the start date.
  if (!req.query.sort) {
    req.query.sort = 'startDate';
  }

  const features = new APIFeatures(
    Event.find({
      approved: true,
      endDate: { $gte: today },
    }),
    req.query
  )
    .filter()
    .sort() // This will now use 'startDate' as the default
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

// FOR PUBLIC: Get details of a single approved event (Unchanged)
export const getPublicEvent = factory.getOne(Event);

// --- ADMIN FUNCTIONS (All Unchanged) ---

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
      html: `<p>Great news! Your event, "${event.title}", has been approved and is now live on TourMyGarage.</p>
      <p>Check it out!</p>`,
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

  // Optional: Notify user of rejection
  try {
    await sendEmail({
      email: event.createdBy.email,
      subject: `Update on your event submission: "${event.title}"`,
      html: `<p>Regarding your event submission for "${event.title}", we were unable to approve it at this time.</p>${reason ? `<p>Reason: ${reason}</p>` : ''}`,
    });
  } catch (err) {
    console.error('Failed to send rejection email:', err);
  }

  res.status(200).json({ status: 'success', message: 'Event rejected.' });
});
