// server/models/garageModel.js
import mongoose from 'mongoose';
//import slugify from 'slugify';

const garageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A garage must have a name.'],
      trim: true,
      unique: true,
    },
    slug: String,
    description: {
      type: String,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: [Number],
      address: String,
    },
    coverPhoto: {
      type: String,
      default: 'default-garage-cover.jpg',
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A garage must belong to a user.'],
    },
    vehicles: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Vehicle',
      },
    ],
    // --- THIS IS THE FIX ---
    // Add the missing fields that the review model calculates.
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10, // Rounds to one decimal place
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- ADD THIS VIRTUAL PROPERTY ---
// This calculates the number of vehicles in the garage and adds it as 'vehicleCount'.
garageSchema.virtual('vehicleCount').get(function () {
  return this.vehicles ? this.vehicles.length : 0;
});

// QUERY MIDDLEWARE: This ensures we only find garages of ACTIVE users.
garageSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name avatar followers location',
    // Only populate the 'user' field if the user has `active: true`
    match: { active: { $ne: false } },
  });
  next();
});

// POST-QUERY MIDDLEWARE: Clean up results where the user was filtered out.
// garageSchema.post(/^find/, function (docs, next) {
//   if (Array.isArray(docs)) {
//     // Remove any garage where `user` is null because the `match` condition failed
//     const filteredDocs = docs.filter(doc => doc.user !== null);
//     docs.length = 0; // Clear the original array
//     docs.push(...filteredDocs); // Push the filtered documents back
//   }
//   next();
// });

const Garage = mongoose.model('Garage', garageSchema);
export default Garage;
