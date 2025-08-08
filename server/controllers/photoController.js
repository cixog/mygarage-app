// server/controllers/photoController.js (Corrected with ES Modules)
import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import { promisify } from 'util';
import Photo from '../models/photoModel.js';
import User from '../models/userModel.js';
import Vehicle from '../models/vehicleModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import * as factory from './handlerFactory.js';

const unlinkAsync = promisify(fs.unlink);

// --- MULTER & SHARP MIDDLEWARE ---
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// This can handle multiple files from a field named 'photos'
export const uploadUserPhoto = upload.fields([
  { name: 'photos', maxCount: 10 },
]);

export const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.files || !req.files.photos) return next();

  req.body.photos = [];
  await Promise.all(
    req.files.photos.map(async (file, i) => {
      const filename = `photo-${req.user.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/photos/${filename}`);
      req.body.photos.push(filename);
    })
  );
  next();
});

// --- CONTROLLERS ---

export const getFeedPhotos = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const followingIds = user.following;

  // If the user isn't following anyone, we can stop early.
  if (!followingIds || followingIds.length === 0) {
    return res.status(200).json({
      status: 'success',
      results: 0,
      data: { photos: [] }, // Send back an empty array
    });
  }

  const photos = await Photo.find({ user: { $in: followingIds } })
    .populate({ path: 'user', select: 'name avatar' })
    .sort({ createdAt: -1 })
    .limit(50);

  res
    .status(200)
    .json({ status: 'success', results: photos.length, data: { photos } });
});

export const getAllPhotos = catchAsync(async (req, res, next) => {
  const photos = await Photo.find()
    .populate({ path: 'user', select: 'name avatar' })
    .sort({ createdAt: -1 });
  res
    .status(200)
    .json({ status: 'success', results: photos.length, data: { photos } });
});

export const createPhoto = catchAsync(async (req, res, next) => {
  const { vehicleId } = req.body;
  if (!vehicleId) {
    return next(new AppError('Vehicle ID is required to upload photos.', 400));
  }
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle || vehicle.user.toString() !== req.user.id) {
    return next(new AppError('Vehicle not found or you do not own it.', 404));
  }
  if (!req.body.photos || req.body.photos.length === 0) {
    return next(new AppError('No photos were processed to be uploaded.', 400));
  }

  const photoPromises = req.body.photos.map(filename =>
    Photo.create({
      user: req.user.id,
      vehicle: vehicleId,
      photo: filename,
      caption: req.body.caption || '',
    })
  );
  const newPhotos = await Promise.all(photoPromises);
  const photoIds = newPhotos.map(p => p._id);

  if (
    vehicle &&
    (vehicle.coverPhoto === 'default-vehicle.png' || !vehicle.coverPhoto)
  ) {
    if (newPhotos.length > 0) {
      vehicle.coverPhoto = newPhotos[0].photo;
      await vehicle.save();
    }
  }

  await Vehicle.findByIdAndUpdate(vehicleId, {
    $push: { photos: { $each: photoIds } },
  });

  res.status(201).json({ status: 'success', data: { photos: newPhotos } });
});

export const updatePhoto = catchAsync(async (req, res, next) => {
  const photo = await Photo.findById(req.params.id);
  if (!photo) {
    return next(new AppError('No photo found with that ID', 404));
  }
  if (photo.user.toString() !== req.user.id) {
    return next(
      new AppError('You do not have permission to edit this photo.', 403)
    );
  }
  const updatedPhoto = await Photo.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ status: 'success', data: { doc: updatedPhoto } });
});

export const toggleLike = catchAsync(async (req, res, next) => {
  const photo = await Photo.findById(req.params.id);
  if (!photo) return next(new AppError('No photo found with that ID', 404));

  const isLiked = photo.likes.includes(req.user.id);
  const updateQuery = isLiked
    ? { $pull: { likes: req.user.id } }
    : { $addToSet: { likes: req.user.id } };

  const updatedPhoto = await Photo.findByIdAndUpdate(
    req.params.id,
    updateQuery,
    { new: true }
  );
  res.status(200).json({ status: 'success', data: { photo: updatedPhoto } });
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

  try {
    await unlinkAsync(`public/img/photos/${photo.photo}`);
  } catch (err) {
    console.error(`Failed to delete photo file: ${photo.photo}`, err);
  }

  if (photo.vehicle) {
    await Vehicle.findByIdAndUpdate(photo.vehicle, {
      $pull: { photos: photoId },
    });
    const parentVehicle = await Vehicle.findById(photo.vehicle);
    if (parentVehicle && parentVehicle.coverPhoto === photo.photo) {
      const remainingPhoto = await Photo.findOne({
        vehicle: parentVehicle._id,
      });
      parentVehicle.coverPhoto = remainingPhoto
        ? remainingPhoto.photo
        : 'default-vehicle.png';
      await parentVehicle.save();
    }
  }

  await Photo.findByIdAndDelete(photoId);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const getPhoto = factory.getOne(Photo, { path: 'comments' });
