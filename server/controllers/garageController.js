// server/controllers/garageController.js (Corrected to filter for active users first)
import Garage from '../models/garageModel.js';
import User from '../models/userModel.js';
// import Vehicle from '../models/vehicleModel.js';
// import Photo from '../models/photoModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import * as factory from './handlerFactory.js';
import APIFeatures from '../utils/apiFeatures.js';

export const getAllGarages = catchAsync(async (req, res, next) => {
  const activeUsers = await User.find({ active: { $ne: false } }).select('_id');
  const activeUserIds = activeUsers.map(user => user._id);

  const features = new APIFeatures(
    // The key change is populating the 'vehicles' path here.
    Garage.find({ user: { $in: activeUserIds } }).populate({
      path: 'vehicles',
      select: 'coverPhoto', // Be efficient, we only need the coverPhoto
    }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const garages = await features.query;

  // This logic will now work correctly because `garage.vehicles` is populated.
  const correctedGarages = garages.map(garage => {
    // The .toObject() is crucial because virtual properties (like vehicleCount)
    // are only present on plain objects, not Mongoose documents by default.
    const garageObj = garage.toObject();

    // The Rule: The cover photo is the cover of the first vehicle, if it exists.
    if (
      garageObj.vehicles &&
      garageObj.vehicles.length > 0 &&
      garageObj.vehicles[0].coverPhoto
    ) {
      garageObj.coverPhoto = garageObj.vehicles[0].coverPhoto;
    } else {
      garageObj.coverPhoto = 'default-garage-cover.jpg';
    }
    return garageObj;
  });

  res.status(200).json({
    status: 'success',
    results: correctedGarages.length,
    data: {
      data: correctedGarages,
    },
  });
});

export const getGarage = catchAsync(async (req, res, next) => {
  const garage = await Garage.findById(req.params.id)
    .populate({
      path: 'user',
      select: 'name avatar location followers createdAt',
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

// ... createMyGarage, updateMyGarage, deleteMyGarage are unchanged ...
export const createMyGarage = catchAsync(async (req, res, next) => {
  // ... no changes here
});

export const updateMyGarage = catchAsync(async (req, res, next) => {
  // ... no changes here
});

export const deleteMyGarage = catchAsync(async (req, res, next) => {
  // ... no changes here
});

// Admin-only functions
export const updateGarage = factory.updateOne(Garage);
export const deleteGarage = factory.deleteOne(Garage);

// ✅ --- MODIFICATION #2 ---
// This is the function for the random "Featured Garages" feed.
export const getRandomGarages = catchAsync(async (req, res, next) => {
  const limit = req.query.limit * 1 || 4;

  const garages = await Garage.aggregate([
    // Stage 1: Join with the users collection to get owner info.
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    // Stage 2: An aggregation lookup returns an array, so deconstruct it.
    { $unwind: '$user' },
    // Stage 3: Filter out any garages owned by an inactive user.
    { $match: { 'user.active': { $ne: false } } },
    // Stage 4: Now that we have a clean list, get a random sample.
    { $sample: { size: limit } },
    // Stage 5: Join with vehicles to figure out the cover photo and count.
    {
      $lookup: {
        from: 'vehicles', // the name of the Vehicle collection
        localField: 'vehicles',
        foreignField: '_id',
        as: 'vehicles_docs',
      },
    },
    // Stage 6: Add the final fields we need for the GarageCard component.
    {
      $addFields: {
        // Calculate the number of vehicles.
        vehicleCount: { $size: '$vehicles_docs' },
        // Get the coverPhoto from the first vehicle in the array.
        coverPhoto: { $arrayElemAt: ['$vehicles_docs.coverPhoto', 0] },
      },
    },
    // Stage 7: Set a default if the coverPhoto is still null (e.g., garage has no vehicles).
    {
      $addFields: {
        coverPhoto: {
          $ifNull: ['$coverPhoto', 'default-garage-cover.jpg'],
        },
      },
    },
    // Stage 8: Clean up the final output to only send what's needed.
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        user: { _id: 1, name: 1, location: 1 }, // Only send minimal user data
        vehicleCount: 1,
        coverPhoto: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: garages.length,
    data: {
      data: garages,
    },
  });
});
