// server/controllers/authController.js
import crypto from 'crypto';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import sendEmail from '../utils/email.js';

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

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
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const verificationToken = newUser.createEmailVerificationToken();

  // --- DIAGNOSTIC LOGS ---
  console.log(
    `SIGNUP: Attempting to save user ${newUser.email} to the database...`
  );
  await newUser.save();
  console.log(
    `SIGNUP: User ${newUser.email} successfully saved with ID ${newUser._id}.`
  );
  // --- END DIAGNOSTIC LOGS ---

  const verificationURL = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  const htmlMessage = `<p>Welcome to MyGarage! Please verify your email by <a href="${verificationURL}">clicking here</a>. The link is valid for 24 hours.</p>`;

  try {
    await sendEmail({
      email: newUser.email,
      subject: 'MyGarage: Please Verify Your Email Address',
      html: htmlMessage,
    });
  } catch (err) {
    console.error('---!!! EMAIL SENDING FAILED !!!---', err);
    await User.findByIdAndDelete(newUser._id);
    return next(
      new AppError(
        'Failed to send verification email. Please use a valid email address and try again.',
        502
      )
    );
  }

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

  const verifiedUser = await User.findById(user._id).populate('garage');
  createSendToken(verifiedUser, 200, res);
});

// The rest of the functions (logout, protect, etc.) are standard and don't need changes.
// I am including them here for completeness.

export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppError('You are not logged in! Please log in.', 401));
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  }
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }
  if (!currentUser.active) {
    return next(new AppError('This user is no longer active.', 401));
  }
  req.user = currentUser;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};

export const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    // For security, always return a success message
    return res.status(200).json({
      status: 'success',
      message: 'If the user exists, an email has been sent.',
    });
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const htmlMessage = `<p>Forgot your password? Please <a href="${resetURL}">click here to reset your password</a> (the link is valid for 10 minutes).</p><p>If you didn't request this, please ignore this email.</p>`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      html: htmlMessage,
    });
    res
      .status(200)
      .json({ status: 'success', message: 'Token sent to email.' });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Error sending the email. Try again later.', 500));
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('Token is invalid or expired.', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const userWithGarage = await User.findById(user._id).populate('garage');
  createSendToken(userWithGarage, 200, res);
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  const userWithGarage = await User.findById(user._id).populate('garage');
  createSendToken(userWithGarage, 200, res);
});
