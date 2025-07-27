const Garage = require('../models/garageModel');
const catchAsync = require('./../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get garage data from collection
  const garages = await Garage.find();

  // 2) Build template

  // 3) Render that template using garage data from 1)
  res.status(200).render('overview', {
    title: 'All Garages',
    garages,
  });
});

exports.getGarage = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested garage (including reviews and guides)

  const garage = await Garage.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  //console.log('here is req.params.slug(vC)', req.params.slug);

  // 2) Build template
  //console.log(garage);
  // 3) Render template using the data from 1)
  res.status(200).render('garage', {
    title: `${garage.name} Garage`,
    garage,
  });
});

exports.getLogInForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};
