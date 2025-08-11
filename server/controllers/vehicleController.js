// server/controllers/vehicleController.js (Corrected with ES Modules)
import fs from 'fs';
import { promisify } from 'util';
import Vehicle from '../models/vehicleModel.js';
import Garage from '../models/garageModel.js';
import Photo from '../models/photoModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import * as factory from './handlerFactory.js';

const unlinkAsync = promisify(fs.unlink);

// --- FACTORY-BASED CONTROLLERS ---
// Use the factory for simple GET operations
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

  const vehicleData = { ...req.body };

  vehicleData.user = req.user.id;
  vehicleData.garage = garage._id;

  const newVehicle = await Vehicle.create(vehicleData);

  // Handle photo uploads if they exist
  if (req.body.photos && req.body.photos.length > 0) {
    const photoPromises = req.body.photos.map(filename =>
      Photo.create({
        user: req.user.id,
        vehicle: newVehicle._id,
        photo: filename,
      })
    );
    const newPhotos = await Promise.all(photoPromises);
    const photoIds = newPhotos.map(p => p._id);

    newVehicle.photos = photoIds;
    if (newPhotos.length > 0) {
      newVehicle.coverPhoto = newPhotos[0].photo;
    }
    await newVehicle.save();
  }

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
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      doc: updatedVehicle,
    },
  });
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

  // Delete associated photo files and documents
  if (vehicle.photos && vehicle.photos.length > 0) {
    const photosToDelete = await Photo.find({ _id: { $in: vehicle.photos } });
    for (const photo of photosToDelete) {
      try {
        await unlinkAsync(`public/img/photos/${photo.photo}`);
      } catch (err) {
        console.error(`Failed to delete photo file: ${photo.photo}`, err);
      }
    }
    await Photo.deleteMany({ _id: { $in: vehicle.photos } });
  }

  // Delete the vehicle document itself
  await Vehicle.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const setVehicleCoverPhoto = catchAsync(async (req, res, next) => {
  const vehicleId = req.params.id;
  const { photoFilename } = req.body;

  if (!photoFilename) {
    return next(new AppError('Photo filename is required.', 400));
  }

  // 1. Find the vehicle and check ownership
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    return next(new AppError('No vehicle found with that ID', 404));
  }
  if (vehicle.user.toString() !== req.user.id) {
    return next(
      new AppError('You do not have permission to perform this action.', 403)
    );
  }

  // 2. Update the vehicle's cover photo
  vehicle.coverPhoto = photoFilename;
  await vehicle.save();

  // 3. THAT'S IT! We no longer try to sync the parent garage here.
  //    We will derive the garage cover photo correctly in the garageController.

  res.status(200).json({
    status: 'success',
    data: {
      doc: vehicle, // Send back the updated vehicle
    },
  });
});

export const toggleLike = catchAsync(async (req, res, next) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) {
    return next(new AppError('No vehicle found with that ID', 404));
  }

  const isLiked = vehicle.likes.includes(req.user.id);
  const updateQuery = isLiked
    ? { $pull: { likes: req.user.id } }
    : { $addToSet: { likes: req.user.id } };

  const updatedVehicle = await Vehicle.findByIdAndUpdate(
    req.params.id,
    updateQuery,
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      vehicle: updatedVehicle,
    },
  });
});

export const getLatestVehicles = catchAsync(async (req, res, next) => {
  const limit = req.query.limit * 1 || 8;

  // Find vehicles and sort by the `updatedAt` field in descending order
  const vehicles = await Vehicle.find()
    .sort({ updatedAt: -1 })
    .limit(limit)
    .populate({
      path: 'garage',
      select: 'name user',
      populate: {
        path: 'user',
        select: 'name',
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
