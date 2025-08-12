// client/src/components/GarageCard.jsx

import { Link } from 'react-router-dom';
import carIcon from '../assets/car-front.svg'; // Ensure this path is correct

export default function GarageCard({ garage }) {
  const coverPhotoUrl =
    garage.coverPhoto && garage.coverPhoto.startsWith('http')
      ? garage.coverPhoto
      : `${import.meta.env.VITE_STATIC_FILES_URL}/img/photos/${
          garage.coverPhoto
        }`;

  return (
    <Link
      to={`/garages/${garage._id}`}
      className="block group bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300"
    >
      {/* Card Image */}
      <div className="h-48 bg-gray-200">
        <img
          src={coverPhotoUrl}
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

        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-x-1 text-sm font-semibold text-gray-700">
            <span>{garage.vehicleCount}</span>
            <img src={carIcon} alt="Vehicles" className="h-5 w-5" />
          </div>

          {/* --- THIS IS THE FIX --- */}
          {/* We now safely access the 'address' property of the location object */}
          <span className="text-xs text-gray-500">
            {garage.user?.location || 'Location not set'}
          </span>
        </div>
      </div>
    </Link>
  );
}
