// server/controllers/userController.js (Corrected with ES Modules)
import multer from 'multer';
import sharp from 'sharp';
import User from '../models/userModel.js';
import Garage from '../models/garageModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import * as factory from './handlerFactory.js';

// --- MULTER & SHARP CONFIGURATION ---
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

export const uploadUserAvatar = upload.single('avatar');

export const resizeUserAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

// --- CONTROLLER LOGIC ---
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
  if (req.file) filteredBody.avatar = req.file.filename;

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

// Factory handlers for admin purposes
export const getAllUsers = factory.getAll(User);
export const getUser = factory.getOne(User, { path: 'garage' }); // Populate garage details
export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);

export const completeOnboarding = catchAsync(async (req, res, next) => {
  // 1. Check if the user already has a garage to prevent duplicates
  if (req.user.garage) {
    return next(new AppError('You have already completed onboarding.', 400));
  }

  // 2. Prepare user updates (bio, location, and avatar if uploaded)
  const userUpdates = {
    bio: req.body.about, // We'll get 'about' from our new form
    location: req.body.location,
  };
  if (req.file) userUpdates.avatar = req.file.filename;

  // 3. Prepare garage data
  const garageData = {
    name: req.body.garageName,
    description: req.body.about, // The 'about' field serves both purposes
    location: req.body.location,
    user: req.user.id,
  };

  // 4. Create the new garage
  const newGarage = await Garage.create(garageData);
  // 5. Add the new garage's ID to the user's document
  userUpdates.garage = newGarage._id;

  // 6. Instead of just updating, we find and update, and store the result
  await User.findByIdAndUpdate(req.user.id, userUpdates);

  // --- THIS IS THE FIX ---
  // After updating the user, we find them again to ensure we can populate the new garage.
  const finalUser = await User.findById(req.user.id).populate('garage');

  res.status(201).json({
    status: 'success',
    data: {
      // Send the fully populated user object back.
      user: finalUser,
    },
  });
});
