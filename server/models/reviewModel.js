// server/models/reviewModel.js (Corrected with ES Modules)
import mongoose from 'mongoose';
import Garage from './garageModel.js';

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    garage: {
      type: mongoose.Schema.ObjectId,
      ref: 'Garage',
      required: [true, 'Review must belong to a garage.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Ensures a user can only leave one review per garage
reviewSchema.index({ garage: 1, user: 1 }, { unique: true });

// Middleware to populate the user's name and photo when fetching reviews
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name avatar',
  });
  next();
});

// Static method to calculate the average rating for a garage
reviewSchema.statics.calcAverageRatings = async function (garageId) {
  const stats = await this.aggregate([
    { $match: { garage: garageId } },
    {
      $group: {
        _id: '$garage',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Garage.findByIdAndUpdate(garageId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    // If no reviews exist, reset to default values
    await Garage.findByIdAndUpdate(garageId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// Hooks to trigger the calculation after a review is saved or deleted
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.garage);
});

// For findByIdAndUpdate and findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.model.findOne(this.getQuery());
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  if (this.r) {
    await this.r.constructor.calcAverageRatings(this.r.garage);
  }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
