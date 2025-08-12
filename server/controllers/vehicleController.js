// server/controllers/vehicleController.js (Final Version with Cloudinary)
import Vehicle from '../models/vehicleModel.js';
import Garage from '../models/garageModel.js';
import Photo from '../models/photoModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import * as factory from './handlerFactory.js';

// --- FACTORY-BASED & OTHER CONTROLLERS (Most are unchanged) ---
export const getVehicle = factory.getOne(Vehicle, [
  { path: 'photos' },
  { path: 'garage' },
]);
export const getAllVehicles = factory.getAll(Vehicle);

export const createVehicle = catchAsync(async (req, res, next) => {
  const garage = await Garage.findOne({ user: req.user.id });
  if (!garage) {
    return next(
      new AppError('You must create a garage before adding a vehicle.', 400)
    );
  }

  // 1. Create the vehicle with only the text data first.
  const vehicleData = {
    make: req.body.make,
    model: req.body.model,
    year: req.body.year,
    description: req.body.description,
    user: req.user.id,
    garage: garage._id,
  };
  const newVehicle = await Vehicle.create(vehicleData);

  // 2. THE FIX: Check for `req.files` which comes from our Cloudinary middleware.
  if (req.files && req.files.length > 0) {
    // 3. Create a Photo document for each uploaded file.
    const photoPromises = req.files.map(file =>
      Photo.create({
        user: req.user.id,
        vehicle: newVehicle._id,
        // `file.path` is the permanent URL from Cloudinary
        photo: file.path,
      })
    );
    const newPhotos = await Promise.all(photoPromises);
    const photoIds = newPhotos.map(p => p._id);

    // 4. Update the new vehicle with the photo references and a cover photo.
    newVehicle.photos = photoIds;
    if (newPhotos.length > 0) {
      newVehicle.coverPhoto = newPhotos[0].photo;
    }
    await newVehicle.save();
  }

  // 5. Add the vehicle reference to its parent garage.
  await Garage.findByIdAndUpdate(garage._id, {
    $push: { vehicles: newVehicle._id },
  });

  res.status(201).json({
    status: 'success',
    data: {
      vehicle: newVehicle,
    },
  });
});

export const updateVehicle = catchAsync(async (req, res, next) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) {
    return next(new AppError('No vehicle found with that ID', 404));
  }
  if (vehicle.user.toString() !== req.user.id) {
    return next(
      new AppError('You do not have permission to perform this action.', 403)
    );
  }

  const updatedVehicle = await Vehicle.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({ status: 'success', data: { doc: updatedVehicle } });
});

export const deleteVehicle = catchAsync(async (req, res, next) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) {
    return next(new AppError('No vehicle found with that ID', 404));
  }
  if (vehicle.user.toString() !== req.user.id) {
    return next(
      new AppError('You do not have permission to perform this action.', 403)
    );
  }

  // Delete associated photo documents
  if (vehicle.photos && vehicle.photos.length > 0) {
    // Note: For a complete solution, you would also delete the image from Cloudinary here.
    await Photo.deleteMany({ _id: { $in: vehicle.photos } });
  }

  // Delete the vehicle document itself
  await Vehicle.findByIdAndDelete(req.params.id);

  res.status(204).json({ status: 'success', data: null });
});

export const setVehicleCoverPhoto = catchAsync(async (req, res, next) => {
  // This controller logic is now correct, as it saves the full photo URL.
  const vehicleId = req.params.id;
  const { photoFilename } = req.body; // The name is misleading, it's a URL

  if (!photoFilename) {
    return next(new AppError('Photo URL is required.', 400));
  }

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    return next(new AppError('No vehicle found with that ID', 404));
  }
  if (vehicle.user.toString() !== req.user.id) {
    return next(
      new AppError('You do not have permission to perform this action.', 403)
    );
  }

  vehicle.coverPhoto = photoFilename;
  await vehicle.save();

  res.status(200).json({ status: 'success', data: { doc: vehicle } });
});

export const toggleLike = catchAsync(async (req, res, next) => {
  const vehicleId = req.params.id;
  const userId = req.user.id;

  const vehicle = await Vehicle.findById(vehicleId);

  if (!vehicle) {
    return next(new AppError('No vehicle found with that ID', 404));
  }

  const isLiked = vehicle.likes.includes(userId);

  const updateQuery = isLiked
    ? { $pull: { likes: userId } }
    : { $addToSet: { likes: userId } };

  const updatedVehicle = await Vehicle.findByIdAndUpdate(
    vehicleId,
    updateQuery,
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      doc: updatedVehicle,
    },
  });
});

export const getLatestVehicles = catchAsync(async (req, res, next) => {
  const limit = req.query.limit * 1 || 8;

  const vehicles = await Vehicle.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    // We need to populate the vehicle's 'garage', and within that, the garage's 'user'.
    .populate({
      path: 'garage',
      select: 'user', // We only need the 'user' field from the garage document
      populate: {
        path: 'user',
        select: 'name', // And we only need the 'name' from the user document
      },
    });

  res.status(200).json({
    status: 'success',
    results: vehicles.length,
    data: {
      data: vehicles,
    },
  });
});
