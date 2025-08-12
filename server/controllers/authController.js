// server/controllers/authController.js (Definitive Final Version)
import crypto from 'crypto';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import sendEmail from '../utils/email.js';

// Helper: Signs a JWT token
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Helper: Creates and sends the token and user data in the response
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  res.cookie('jwt', token, cookieOptions);

  // Explicitly remove password from the output user object
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export const signup = catchAsync(async (req, res, next) => {
  // 1. Create a new user instance with data from the request body.
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // 2. Generate an email verification token for the new user.
  const verificationToken = newUser.createEmailVerificationToken();
  // We must save the user again here to persist the token to the database.
  await newUser.save({ validateBeforeSave: false });

  // 3. Send the verification email.
  const verificationURL = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  const htmlMessage = `<p>Welcome to MyGarage! Please verify your email by <a href="${verificationURL}">clicking here</a>. The link is valid for 24 hours.</p>`;

  try {
    await sendEmail({
      email: newUser.email,
      subject: 'MyGarage: Please Verify Your Email Address',
      html: htmlMessage,
    });
  } catch (err) {
    // If email fails, delete the user to allow them to try again.
    await User.findByIdAndDelete(newUser._id);
    console.error('---!!! EMAIL SENDING FAILED !!!---', err);
    return next(
      new AppError('Failed to send verification email. Please try again.', 502)
    );
  }

  // 4. Send a success response to the client.
  res.status(201).json({
    status: 'success',
    message: 'Account created! Please check your email to verify your account.',
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Find the user by email and include the password for comparison
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (!user.isVerified) {
    return next(
      new AppError(
        'Your account is not verified. Please check your email for a verification link.',
        401
      )
    );
  }

  // We must re-fetch the user to populate their garage details correctly.
  const userWithGarage = await User.findById(user._id).populate('garage');
  createSendToken(userWithGarage, 200, res);
});

export const verifyEmail = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired.', 400));
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // After verification, log the user in and send their data.
  const verifiedUser = await User.findById(user._id).populate('garage');
  createSendToken(verifiedUser, 200, res);
});

// The rest of the functions (logout, protect, etc.) are standard and don't need changes.
export const logout = (req, res) => {
  /* ... */
};
export const protect = catchAsync(async (req, res, next) => {
  /* ... */
});
export const restrictTo = (...roles) => {
  /* ... */
};
export const forgotPassword = catchAsync(async (req, res, next) => {
  /* ... */
});
export const resetPassword = catchAsync(async (req, res, next) => {
  /* ... */
});
export const updatePassword = catchAsync(async (req, res, next) => {
  /* ... */
});
