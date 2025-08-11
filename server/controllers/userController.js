// server/controllers/userController.js (Final Version with Cloudinary)
import multer from 'multer';
import User from '../models/userModel.js';
import Garage from '../models/garageModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import * as factory from './handlerFactory.js';

// --- 1. IMPORT the Cloudinary storage engine we created ---
import { storage } from '../utils/cloudinary.js';

// --- 2. CONFIGURE Multer to use Cloudinary for storage ---
// Instead of saving to memory, multer will now stream the file directly
// to Cloudinary using the storage engine we imported.
const upload = multer({ storage: storage });

// --- 3. EXPORT the Multer middleware for avatar uploads ---
// The route will use this to intercept a file field named 'avatar'.
export const uploadUserAvatar = upload.single('avatar');

// --- 4. DELETE the old resizeUserAvatar middleware ---
// The entire `resizeUserAvatar` function is no longer needed because
// Cloudinary handles image processing and storage. It should be fully removed.

// --- UTILITY and ROUTE-SPECIFIC CONTROLLERS ---
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Middleware to get the current user's ID for the /me endpoint
export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

export const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates.', 400));
  }
  const filteredBody = filterObj(req.body, 'name', 'bio', 'location');

  // --- 5. THE FIX: Get the image URL from Cloudinary ---
  // If a file was uploaded, multer-storage-cloudinary provides its public URL
  // in the `req.file.path` property. We save this full URL to the database.
  if (req.file) {
    filteredBody.avatar = req.file.path;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

export const completeOnboarding = catchAsync(async (req, res, next) => {
  if (req.user.garage) {
    return next(new AppError('You have already completed onboarding.', 400));
  }

  const userUpdates = {
    bio: req.body.about,
    location: req.body.location,
  };

  // --- 6. THE FIX: Get the avatar URL from Cloudinary ---
  // Same as updateMe, we get the permanent URL from `req.file.path`.
  if (req.file) {
    userUpdates.avatar = req.file.path;
  }

  const garageData = {
    name: req.body.garageName,
    description: req.body.about,
    location: req.body.location,
    user: req.user.id,
  };

  const newGarage = await Garage.create(garageData);
  userUpdates.garage = newGarage._id;

  await User.findByIdAndUpdate(req.user.id, userUpdates);

  const finalUser = await User.findById(req.user.id).populate('garage');

  res.status(201).json({
    status: 'success',
    data: {
      user: finalUser,
    },
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const follow = catchAsync(async (req, res, next) => {
  if (req.user.id === req.params.id) {
    return next(new AppError('You cannot follow yourself.', 400));
  }
  await User.findByIdAndUpdate(req.user.id, {
    $addToSet: { following: req.params.id },
  });
  await User.findByIdAndUpdate(req.params.id, {
    $addToSet: { followers: req.user.id },
  });
  res.status(200).json({ status: 'success', message: 'User followed.' });
});

export const unfollow = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    $pull: { following: req.params.id },
  });
  await User.findByIdAndUpdate(req.params.id, {
    $pull: { followers: req.user.id },
  });
  res.status(200).json({ status: 'success', message: 'User unfollowed.' });
});

export const getFollowedGarages = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const { following } = user;

  if (!following || following.length === 0) {
    return res.status(200).json({
      status: 'success',
      results: 0,
      data: { data: [] },
    });
  }

  const garages = await Garage.find({ user: { $in: following } }).populate({
    path: 'vehicles',
    select: 'coverPhoto',
  });

  const correctedGarages = garages.map(garage => {
    const garageObj = garage.toObject();
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

// --- ADMIN FACTORY HANDLERS (Unchanged) ---
export const getAllUsers = factory.getAll(User);
export const getUser = factory.getOne(User, { path: 'garage' });
export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);
