// client/src/components/VehicleCard.jsx
import { Link } from 'react-router-dom';

export default function VehicleCard({ vehicle }) {
  const coverPhotoUrl = vehicle.coverPhoto?.startsWith('http')
    ? vehicle.coverPhoto
    : `${import.meta.env.VITE_STATIC_FILES_URL}/img/users/default.jpg`;

  // Defensive check for nested properties
  const ownerName = vehicle.garage?.user?.name || 'an owner';

  return (
    <Link
      to={`/vehicles/${vehicle._id}`}
      className="block group bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300"
    >
      {/* Card Image */}
      <div className="h-48 bg-gray-200">
        <img
          src={coverPhotoUrl}
          alt={`Cover for ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Card Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 truncate group-hover:text-blue-600">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          From the garage of {ownerName}
        </p>
      </div>
    </Link>
  );
}
