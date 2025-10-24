// client/src/components/GarageCard.jsx

import { Link } from 'react-router-dom';
import carIcon from '../assets/car-front.svg'; // Ensure this path is correct

// A helper function to transform Cloudinary URLs
const transformCloudinaryUrl = (url, width) => {
  // If it's not a cloudinary URL, return it as is
  if (!url || !url.includes('res.cloudinary.com')) {
    return url;
  }
  // This is a simple example. You can add more complex transformations.
  // f_auto = automatically choose the best format (like webp)
  // q_auto = automatically set the best quality
  // w_...  = set the width
  const transformation = `f_auto,q_auto,w_${width}`;
  return url.replace('/upload/', `/upload/${transformation}/`);
};

export default function GarageCard({ garage }) {
  const originalCoverPhotoUrl =
    garage.coverPhoto && garage.coverPhoto.startsWith('http')
      ? garage.coverPhoto
      : `${import.meta.env.VITE_STATIC_FILES_URL}/img/photos/${
          garage.coverPhoto
        }`;

  // ✅ OPTIMIZATION: Request a smaller, optimized version for the card
  const optimizedCoverPhotoUrl = transformCloudinaryUrl(
    originalCoverPhotoUrl,
    400
  ); // Request a 400px wide version

  return (
    <Link
      to={`/garages/${garage._id}`}
      className="block group bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300"
    >
      <div className="h-48 bg-gray-200">
        <img
          src={optimizedCoverPhotoUrl} // Use the optimized URL
          alt={`Cover for ${garage.name}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Card Content */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800 truncate group-hover:text-blue-600">
          {garage.name}
        </h3>
        <p className="text-sm text-gray-600 mt-1 h-10 overflow-hidden">
          {garage.description || 'No description provided.'}
        </p>

        {/* Combine count and location into one easily-spaced flex container */}
        <div className="flex items-center mt-4 text-sm font-semibold text-gray-700">
          {/* 1. Vehicle Count with Icon (Icon has right margin mr-1) */}
          <div className="flex items-center">
            <span>{garage.vehicleCount}</span>
            <img src={carIcon} alt="Vehicles" className="h-5 w-5 ml-1" />
          </div>

          {/* 2. Separator */}
          {/* Use a vertical pipe '|' or a middle dot '·' with horizontal margin (mx-2) */}
          <span className="mx-2 text-gray-400">|</span>

          {/* 3. Location (Note: Lower text size text-xs is preserved) */}
          <span className="text-xs text-gray-500 font-normal">
            {/* 👇 THE FIX: Show the full address if it's different from the user's general location */}
            {
              garage.location?.address &&
              garage.location.address !== garage.user?.location
                ? garage.location.address // Use the specific garage address
                : garage.user?.location || 'Location not set' // Fall back to the general user location
            }
          </span>
        </div>
      </div>
    </Link>
  );
}
