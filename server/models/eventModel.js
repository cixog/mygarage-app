// server/models/eventModel.js
import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'An event must have a title.'],
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      required: [true, 'A short description is required.'],
    },
    fullDescription: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'An event must have a start date.'],
    },
    endDate: {
      type: Date,
      required: [true, 'An event must have an end date.'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: [Number], // [longitude, latitude]
      address: String,
    },
    image: String,
    // This flag is controlled by the admin workflow
    approved: {
      type: Boolean,
      default: false,
      select: false, // Hide from public API responses by default
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: Date,
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'An event must be submitted by a user.'],
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    // This status field makes the admin workflow clearer
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      select: false, // Hide from public API responses
    },
    category: {
      type: String,
      required: [true, 'An event must have a category.'],
      enum: [
        'Cars & Coffee',
        'Track Day',
        'Concours',
        'Auction',
        'Club Meetup',
        'Museum Exhibit',
        'Other',
      ],
      default: 'Other',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
eventSchema.index({ location: '2dsphere' });
eventSchema.index({ startDate: 1, approved: 1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;
