// server/models/vehicleModel.js (Corrected with ES Modules)
import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    // --- CRITICAL LINKS TO PARENTS ---
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A vehicle must belong to a user.'],
    },
    garage: {
      type: mongoose.Schema.ObjectId,
      ref: 'Garage',
      required: [true, 'A vehicle must be part of a garage.'],
    },

    // --- VEHICLE METADATA ---
    make: {
      type: String,
      required: [true, 'A vehicle must have a make (e.g., Ford).'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'A vehicle must have a model (e.g., Mustang).'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'A vehicle must have a year.'],
    },
    description: {
      type: String,
      trim: true,
    },
    story: {
      type: String,
      trim: true,
    },
    tags: [String],
    condition: String,

    // --- CHILD RELATIONSHIP ---
    photos: [{ type: mongoose.Schema.ObjectId, ref: 'Photo' }],

    coverPhoto: {
      type: String,
      default: 'default-vehicle.png',
    },

    // --- SOCIAL FEATURES ---
    likes: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create an index for faster querying of a user's vehicles
vehicleSchema.index({ user: 1, garage: 1 });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;
