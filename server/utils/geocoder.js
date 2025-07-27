import axios from 'axios';
import AppError from './AppError.js';
/*
Geocodes a location string (like a zip code or address) into coordinates.
@param {string} locationString The address or zip code to geocode.
@returns {Promise<[number, number]>} A promise that resolves to an array [longitude, latitude].
*/
const geocode = async locationString => {
  try {
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationString)}.json`,
      {
        params: {
          access_token: process.env.MAPBOX_ACCESS_TOKEN,
          limit: 1, // We only need the most relevant result
        },
      }
    );
    if (response.data.features.length === 0) {
      throw new AppError('Could not find location. Please try another.', 404);
    }
    const [longitude, latitude] = response.data.features[0].center;
    return [longitude, latitude];
  } catch (error) {
    console.error('Mapbox Geocoding Error:', error.message);
    // If it's an AppError we created, re-throw it. Otherwise, wrap it.
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      'Error contacting map service. Please try again later.',
      500
    );
  }
};
export default geocode;
