// server/models/photoModel.js (Corrected with ES Modules)
import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A photo must belong to a user.'],
  },
  vehicle: {
    type: mongoose.Schema.ObjectId,
    ref: 'Vehicle',
    required: [true, 'A photo must be associated with a vehicle.'],
  },
  photo: {
    type: String,
    required: [true, 'A photo must have an image file.'],
  },
  caption: {
    type: String,
    trim: true,
    maxlength: 2200,
  },
  likes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

photoSchema.index({ vehicle: 1 }); // Index for fast photo lookups per vehicle

const Photo = mongoose.model('Photo', photoSchema);

export default Photo;
