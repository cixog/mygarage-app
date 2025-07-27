// server/models/commentModel.js
import mongoose from 'mongoose'; // <-- Use import for mongoose

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Comment cannot be empty.'],
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    vehicle: {
      type: mongoose.Schema.ObjectId,
      ref: 'Vehicle',
      required: [true, 'A comment must belong to a vehicle.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A comment must have an author.'],
    },
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

commentSchema.index({ vehicle: 1 }); // <-- This was 'photo', corrected to 'vehicle'
commentSchema.index({ user: 1 });

commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name avatar',
  });
  next();
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment; // <-- Export the MODEL, not a router
