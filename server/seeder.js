// This is a conceptual script. You would need to fill it out.
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Garage from './models/garageModel.js';
import Event from './models/eventModel.js';
import geocode from './utils/geocoder.js';

dotenv.config({ path: './config.env' });

await mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const geocodeExistingData = async () => {
  try {
    const garages = await Garage.find({ 'location.coordinates': { $size: 0 } });
    for (const garage of garages) {
      if (garage.location.address) {
        const [lng, lat] = await geocode(garage.location.address);
        garage.location.coordinates = [lng, lat];
        await garage.save({ validateBeforeSave: false });
        console.log(`Geocoded garage: ${garage.name}`);
      }
    }
    // ... Repeat for Events ...
    console.log('Geocoding complete!');
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

if (process.argv[2] === '--geocode') {
  geocodeExistingData();
}
