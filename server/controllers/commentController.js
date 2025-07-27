// server/controllers/commentController.js (Corrected with ES Modules)
import Comment from '../models/commentModel.js';
import * as factory from './handlerFactory.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

// Middleware to set the vehicle and user IDs before creating a comment
export const setVehicleUserIds = (req, res, next) => {
  // Allow nested routes by getting the vehicleId from the URL
  if (!req.body.vehicle) req.body.vehicle = req.params.vehicleId;
  // Get the userId from the logged-in user
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

export const toggleLike = catchAsync(async (req, res, next) => {
  const commentId = req.params.id;
  const userId = req.user.id;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    return next(new AppError('No comment found with that ID', 404));
  }

  const isLiked = comment.likes.includes(userId);

  const updateQuery = isLiked
    ? { $pull: { likes: userId } }
    : { $addToSet: { likes: userId } };

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    updateQuery,
    {
      new: true,
    }
  ).populate({
    path: 'user',
    select: 'name avatar',
  });

  res.status(200).json({
    status: 'success',
    data: {
      doc: updatedComment,
    },
  });
});

// Use the generic factory functions for all standard CRUD operations
export const getAllComments = factory.getAll(Comment);
export const getComment = factory.getOne(Comment);
export const createComment = factory.createOne(Comment);
export const updateComment = factory.updateOne(Comment);
export const deleteComment = factory.deleteOne(Comment);
