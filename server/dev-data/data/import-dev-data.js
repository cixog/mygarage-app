const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Garage = require('../../models/garageModel');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');
const Photo = require('../../models/photoModel');

dotenv.config({ path: path.join(__dirname, '../../config.env') });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => {
    console.log('DB connection successful');
  })
  .catch(err => {
    console.error('DB connection error:', err);
  });

// READ JSON FILE
const garages = JSON.parse(
  fs.readFileSync(`${__dirname}/garages.json`, 'utf-8')
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);
const photos = JSON.parse(fs.readFileSync(`${__dirname}/photos.json`, 'utf-8'));

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Garage.create(garages, { validateBeforeSave: false });
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    await Photo.create(photos);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Garage.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    await Photo.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
