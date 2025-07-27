// client/src/components/PhotoCard.jsx (Corrected)
import { Link } from 'react-router-dom';

const PhotoCard = ({ photo }) => {
  // Defensive coding in case user somehow isn't populated
  const authorName = photo.user ? photo.user.name : 'Unknown User';
  const authorAvatar = photo.user
    ? `${import.meta.env.VITE_STATIC_FILES_URL}/img/users/${photo.user.avatar}`
    : `${import.meta.env.VITE_STATIC_FILES_URL}/img/users/default.jpg`;
  const authorProfileLink = photo.user ? `/profile/${photo.user._id}` : '#';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      {/* Card Header with Author Info */}
      <div className="p-3 flex items-center space-x-3">
        <Link to={authorProfileLink}>
          <img
            src={authorAvatar}
            alt={authorName}
            className="w-10 h-10 rounded-full object-cover"
          />
        </Link>
        <div>
          <Link
            to={authorProfileLink}
            className="font-semibold text-gray-800 hover:underline"
          >
            {authorName}
          </Link>
          <p className="text-sm text-gray-500">
            {new Date(photo.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* The Photo */}
      <div className="bg-black">
        <Link to={authorProfileLink}>
          {/* --- THIS IS THE FIX --- */}
          {/* Replaced hardcoded URL with the environment variable */}
          <img
            src={`${import.meta.env.VITE_STATIC_FILES_URL}/img/photos/${
              photo.photo
            }`}
            alt={photo.caption || 'User upload'}
            className="w-full h-auto max-h-[70vh] object-contain"
          />
        </Link>
      </div>

      {/* Card Body with Caption and Likes */}
      <div className="p-4">
        <div className="flex items-center mb-2">
          <span
            className={`mr-2 text-xl ${
              photo.likes?.length > 0 ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            ♥
          </span>
          <span className="font-semibold">
            {photo.likes?.length || 0}{' '}
            {photo.likes?.length === 1 ? 'like' : 'likes'}
          </span>
        </div>
        <p className="text-gray-700">
          <Link
            to={authorProfileLink}
            className="font-bold mr-2 hover:underline"
          >
            {authorName}
          </Link>
          {photo.caption}
        </p>
      </div>
    </div>
  );
};

export default PhotoCard;
