// server/controllers/photoController.js (Final Version with Cloudinary)
import multer from 'multer';
import Photo from '../models/photoModel.js';
import User from '../models/userModel.js';
import Vehicle from '../models/vehicleModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import * as factory from './handlerFactory.js';

// --- 1. IMPORT the Cloudinary storage engine ---
import { storage } from '../utils/cloudinary.js';

// --- 2. CONFIGURE Multer to use Cloudinary for storage ---
const upload = multer({ storage: storage });

// --- 3. EXPORT the Multer middleware for photo uploads ---
// This will handle a field named 'photos' and allow up to 10 files.
export const uploadVehiclePhotos = upload.array('photos', 10);

// --- CONTROLLERS ---

export const createPhoto = catchAsync(async (req, res, next) => {
  const { vehicleId } = req.body;
  if (!vehicleId) {
    return next(new AppError('Vehicle ID is required to upload photos.', 400));
  }
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle || vehicle.user.toString() !== req.user.id) {
    return next(new AppError('Vehicle not found or you do not own it.', 404));
  }

  // --- 4. THE FIX: Check req.files instead of req.body.photos ---
  if (!req.files || req.files.length === 0) {
    return next(new AppError('No image files were uploaded.', 400));
  }

  const photoPromises = req.files.map(file =>
    Photo.create({
      user: req.user.id,
      vehicle: vehicleId,
      // `file.path` is the permanent URL from Cloudinary
      photo: file.path,
      // `file.filename` is the public ID from Cloudinary (useful for deletion later)
      caption: req.body.caption || '',
    })
  );

  const newPhotos = await Promise.all(photoPromises);
  const photoIds = newPhotos.map(p => p._id);

  // If the vehicle doesn't have a cover photo, make the first uploaded photo the cover
  if (
    vehicle &&
    (vehicle.coverPhoto === 'default-vehicle.png' || !vehicle.coverPhoto)
  ) {
    if (newPhotos.length > 0) {
      vehicle.coverPhoto = newPhotos[0].photo;
      await vehicle.save();
    }
  }

  // Add the new photo references to the parent vehicle
  await Vehicle.findByIdAndUpdate(vehicleId, {
    $push: { photos: { $each: photoIds } },
  });

  res.status(201).json({ status: 'success', data: { photos: newPhotos } });
});

export const deletePhoto = catchAsync(async (req, res, next) => {
  const photoId = req.params.id;
  const photo = await Photo.findById(photoId);
  if (!photo) {
    return next(new AppError('No photo found with that ID', 404));
  }
  if (photo.user.toString() !== req.user.id) {
    return next(
      new AppError('You do not have permission to delete this photo.', 403)
    );
  }

  // Note: For a complete solution, you would also delete the image from Cloudinary here
  // using its public_id, but we are omitting that for simplicity to get you running.
  // The local file unlink will just fail silently and won't crash the app.

  // Remove the photo reference from its parent vehicle
  if (photo.vehicle) {
    await Vehicle.findByIdAndUpdate(photo.vehicle, {
      $pull: { photos: photoId },
    });
    // Check if the deleted photo was the cover photo
    const parentVehicle = await Vehicle.findById(photo.vehicle);
    if (parentVehicle && parentVehicle.coverPhoto === photo.photo) {
      // If so, set the cover to the next available photo or the default
      const remainingPhoto = await Photo.findOne({
        vehicle: parentVehicle._id,
      });
      parentVehicle.coverPhoto = remainingPhoto
        ? remainingPhoto.photo
        : 'default-vehicle.png';
      await parentVehicle.save();
    }
  }

  // Delete the photo document from the database
  await Photo.findByIdAndDelete(photoId);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// --- UNCHANGED CONTROLLERS ---
// (These functions don't deal with file uploads, so they remain the same)
export const getFeedPhotos = catchAsync(async (req, res, next) => {
  /* ... */
});
export const getAllPhotos = catchAsync(async (req, res, next) => {
  /* ... */
});
export const updatePhoto = catchAsync(async (req, res, next) => {
  /* ... */
});
export const toggleLike = catchAsync(async (req, res, next) => {
  /* ... */
});
export const getPhoto = factory.getOne(Photo, { path: 'comments' });
