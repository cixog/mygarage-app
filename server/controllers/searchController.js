// server/controllers/searchController.js (Corrected with ES Modules)
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import Garage from '../models/garageModel.js';
import User from '../models/userModel.js';
import Vehicle from '../models/vehicleModel.js';
import Event from '../models/eventModel.js';
import geocode from '../utils/geocoder.js';

export const globalSearch = catchAsync(async (req, res, next) => {
  const query = req.query.q;
  if (!query) {
    return res
      .status(200)
      .json({ status: 'success', data: { garages: [], users: [] } });
  }

  const regex = new RegExp(query, 'i');

  const matchingVehicles = await Vehicle.find({
    $or: [{ make: regex }, { model: regex }],
  }).select('garage');

  const garageIdsFromVehicles = [
    ...new Set(matchingVehicles.map(v => v.garage)),
  ];

  const garageQuery = {
    $or: [{ name: regex }, { _id: { $in: garageIdsFromVehicles } }],
  };

  const [garages, users] = await Promise.all([
    Garage.find(garageQuery).limit(10),
    User.find({ name: regex, active: { $ne: false } })
      .select('name avatar location')
      .limit(10),
  ]);

  res.status(200).json({
    status: 'success',
    data: { garages, users },
  });
});

export const searchNearby = catchAsync(async (req, res, next) => {
  const { location, distance } = req.query;

  if (!location || !distance) {
    return next(new AppError('Please provide a location and a distance.', 400));
  }

  const [lng, lat] = await geocode(location);

  // Earth radius = 3963.2 miles or 6378.1 kilometers
  const radius = distance / 3963.2;

  const [garages, events] = await Promise.all([
    Garage.find({
      location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    }),
    Event.find({
      approved: true,
      endDate: { $gte: new Date() },
      location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    }),
  ]);

  res.status(200).json({
    status: 'success',
    results: garages.length + events.length,
    data: {
      garages,
      events,
    },
  });
});
