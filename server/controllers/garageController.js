// server/controllers/garageController.js (FINAL, with Cover Photo Correction Logic)
import Garage from '../models/garageModel.js';
import User from '../models/userModel.js';
import Vehicle from '../models/vehicleModel.js';
import Photo from '../models/photoModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import * as factory from './handlerFactory.js';
import APIFeatures from '../utils/apiFeatures.js';

// This new, smarter controller replaces factory.getAll(Garage)
export const getAllGarages = catchAsync(async (req, res, next) => {
  // 1. Use APIFeatures to get the correct set of garages (newest, featured, etc.)
  // We populate 'vehicles' with just their cover photos to be efficient.
  const features = new APIFeatures(
    Garage.find().populate({
      path: 'vehicles',
      select: 'coverPhoto', // Select only the field we need
    }),
    req.query
  )
    .filter()
    .sort() // This will now work correctly with the updated schema
    .limitFields()
    .paginate();

  const garages = await features.query;

  // 2. --- THIS IS THE CRITICAL DATA CORRECTION STEP ---
  // Post-process the results to ensure the cover photo is always valid.
  const correctedGarages = garages.map(garage => {
    const garageObj = garage.toObject(); // Work with a plain object

    // If the garage has vehicles with cover photos, its cover MUST be the cover of its first vehicle.
    if (
      garageObj.vehicles &&
      garageObj.vehicles.length > 0 &&
      garageObj.vehicles[0].coverPhoto
    ) {
      garageObj.coverPhoto = garageObj.vehicles[0].coverPhoto;
    } else {
      // If the garage has NO vehicles, it MUST use the default image.
      garageObj.coverPhoto = 'default-garage-cover.jpg';
    }
    return garageObj;
  });

  // 3. Send the corrected and verified data to the client.
  res.status(200).json({
    status: 'success',
    results: correctedGarages.length,
    data: {
      data: correctedGarages,
    },
  });
});

// The rest of your controller functions remain the same.
export const getGarage = catchAsync(async (req, res, next) => {
  const garage = await Garage.findById(req.params.id)
    .populate({
      path: 'user',
      select: 'name avatar location createdAt followers',
    })
    .populate({
      path: 'vehicles',
      select: 'make model year coverPhoto _id',
    });

  if (!garage || !garage.user) {
    return next(
      new AppError(
        'No garage found with that ID or its owner is inactive.',
        404
      )
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      garage,
    },
  });
});

export const createMyGarage = catchAsync(async (req, res, next) => {
  if (req.user.garage) {
    return next(
      new AppError('You already have a garage. You can only create one.', 400)
    );
  }
  req.body.user = req.user.id;
  const newGarage = await Garage.create(req.body);
  await User.findByIdAndUpdate(req.user.id, { garage: newGarage._id });
  res.status(201).json({
    status: 'success',
    data: {
      garage: newGarage,
    },
  });
});

export const updateMyGarage = catchAsync(async (req, res, next) => {
  const garageId = req.user.garage;
  if (!garageId) {
    return next(new AppError('You do not have a garage to update.', 404));
  }
  const allowedUpdates = {
    name: req.body.name,
    description: req.body.description,
    location: req.body.location,
  };
  const updatedGarage = await Garage.findByIdAndUpdate(
    garageId,
    allowedUpdates,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({
    status: 'success',
    data: {
      garage: updatedGarage,
    },
  });
});

export const deleteMyGarage = catchAsync(async (req, res, next) => {
  const garageId = req.user.garage;
  if (!garageId) {
    return next(new AppError('You do not have a garage to delete.', 404));
  }

  const vehicles = await Vehicle.find({ garage: garageId });
  const photoIds = vehicles.flatMap(vehicle => vehicle.photos);

  await Promise.all([
    Photo.deleteMany({ _id: { $in: photoIds } }),
    Vehicle.deleteMany({ garage: garageId }),
    Garage.findByIdAndDelete(garageId),
    User.findByIdAndUpdate(req.user.id, { $unset: { garage: '' } }),
  ]);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Admin-only functions
export const updateGarage = factory.updateOne(Garage);
export const deleteGarage = factory.deleteOne(Garage);
