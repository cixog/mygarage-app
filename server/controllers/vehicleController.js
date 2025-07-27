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
  delete vehicleData.photos; // Temporarily remove photos array

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

  // --- THIS IS THE NEW, CRITICAL LOGIC ---
  const parentGarage = await Garage.findById(vehicle.garage);

  // Remove vehicle reference from the garage
  if (parentGarage) {
    parentGarage.vehicles.pull(vehicle._id);

    // Check if the deleted vehicle was the cover
    if (parentGarage.coverPhoto === vehicle.coverPhoto) {
      if (parentGarage.vehicles.length > 0) {
        // If there are other vehicles, set the cover to the first remaining one
        const newCoverVehicle = await Vehicle.findById(
          parentGarage.vehicles[0]
        );
        parentGarage.coverPhoto = newCoverVehicle
          ? newCoverVehicle.coverPhoto
          : 'default-garage-cover.jpg';
      } else {
        // If no vehicles are left, set to default
        parentGarage.coverPhoto = 'default-garage-cover.jpg';
      }
    }
    await parentGarage.save();
  }
  // --- END OF NEW LOGIC ---

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

  // --- THIS IS THE NEW, CRITICAL LOGIC ---
  // 3. Find the parent garage
  const parentGarage = await Garage.findById(vehicle.garage);
  if (parentGarage) {
    // 4. Get the ID of the very first vehicle in the garage's list
    const firstVehicleId = parentGarage.vehicles[0]?.toString();

    // 5. Check if the vehicle we just updated IS the first vehicle
    if (vehicleId === firstVehicleId) {
      // 6. If it is, update the GARAGE's cover photo to match.
      parentGarage.coverPhoto = photoFilename;
      await parentGarage.save();
    }
  }
  // --- END OF NEW LOGIC ---

  // 7. Send success response
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
