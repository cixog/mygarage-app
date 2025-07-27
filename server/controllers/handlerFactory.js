// server/controllers/handlerFactory.js (Corrected with ID Validation)
import mongoose from 'mongoose'; // <-- Add this import
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import APIFeatures from '../utils/apiFeatures.js';

export const deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

export const updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    return res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

export const createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

// --- THIS FUNCTION IS THE FIX ---
export const getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    // First, check if the provided ID is a valid MongoDB ObjectId format.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      // If not, immediately send a 404 error and stop. This prevents a CastError crash.
      return next(new AppError('No document found with that ID', 404));
    }

    // If the ID format is valid, then proceed with the query.
    let query = Model.findById(id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { doc },
    });
  });

export const getAll = Model =>
  catchAsync(async (req, res, next) => {
    // Allow for nested GET routes on reviews or comments
    let filter = {};
    if (req.params.garageId) filter = { garage: req.params.garageId };
    if (req.params.vehicleId) filter = { vehicle: req.params.vehicleId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
