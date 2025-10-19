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
    url: {
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
      // --- MODIFICATION START ---
      // Replace the single 'address' string with these fields
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      // --- MODIFICATION END ---
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
        'Car/Truck/Bike Show',
        'Cars & Coffee',
        'Rally',
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

// --- NEW VIRTUAL PROPERTY ---
// This creates a full, readable address string without storing it directly.
eventSchema.virtual('fullAddress').get(function () {
  let parts = [];
  if (this.location?.address) parts.push(this.location.address);
  if (this.location?.city) parts.push(this.location.city);
  if (this.location?.state) parts.push(this.location.state);
  return parts.join(', ');
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
