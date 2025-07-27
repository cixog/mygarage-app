// server/controllers/reviewController.js (Corrected with ES Modules)
import Review from '../models/reviewModel.js';
import * as factory from './handlerFactory.js';

// Middleware to set the garageId and userId on the request body
// This is for creating a review via a nested route like /garages/:garageId/reviews
export const setGarageUserIds = (req, res, next) => {
  if (!req.body.garage) req.body.garage = req.params.garageId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// Use the generic factory functions for all standard CRUD operations
export const getAllReviews = factory.getAll(Review);
export const getReview = factory.getOne(Review);
export const createReview = factory.createOne(Review);
export const updateReview = factory.updateOne(Review);
export const deleteReview = factory.deleteOne(Review);
