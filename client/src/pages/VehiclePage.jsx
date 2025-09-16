import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';

import PhotoModal from '../components/PhotoModal';
import PhotoUpload from '../components/PhotoUpload';
import EditVehicleForm from '../components/EditVehicleForm';

const VehicleStat = ({ label, value }) => (
  <div className="flex justify-between border-b border-gray-200 py-2">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="text-sm font-semibold text-gray-800">{value}</dd>
  </div>
);

export default function VehiclePage() {
  const { vehicleId } = useParams();
  const { user: loggedInUser } = useAuth();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const fetchPageData = async () => {
    setLoading(true);
    setError(null);
    setVehicle(null);
    try {
      const [vehicleRes, commentsRes] = await Promise.all([
        api.get(`/vehicles/${vehicleId}`),
        api.get(`/vehicles/${vehicleId}/comments`),
      ]);
      setVehicle(vehicleRes.data.data.doc);
      setComments(commentsRes.data.data.data);
    } catch (err) {
      console.error('Failed to fetch page data:', err);
      setError('Could not load vehicle details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vehicleId) {
      fetchPageData();
    }
  }, [vehicleId]);

  useEffect(() => {
    if (vehicle) {
      setLikeCount(vehicle.likes?.length || 0);
      setIsLiked(
        loggedInUser ? vehicle.likes.includes(loggedInUser._id) : false
      );
    }
  }, [vehicle, loggedInUser]);

  const handleUploadSuccess = () => {
    setIsUploadModalOpen(false);
    fetchPageData();
  };

  const handleUpdateSuccess = () => {
    setIsEditModalOpen(false);
    fetchPageData();
  };

  const handleDeleteVehicle = async () => {
    if (
      !window.confirm(
        'Are you sure you want to permanently delete this vehicle?'
      )
    )
      return;
    try {
      await api.delete(`/vehicles/${vehicleId}`);
      toast.success('Vehicle deleted successfully.');
      navigate(`/profile`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete vehicle.');
    }
  };

  const handleLikeToggle = async () => {
    if (!loggedInUser) {
      toast.error('You must be logged in to like a vehicle.');
      return;
    }
    const originalIsLiked = isLiked;
    setIsLiked(!originalIsLiked);
    setLikeCount(prev => (originalIsLiked ? prev - 1 : prev + 1));
    try {
      await api.patch(`/vehicles/${vehicleId}/like`);
    } catch (err) {
      toast.error('Failed to update like status.');
      setIsLiked(originalIsLiked);
      setLikeCount(prev => (originalIsLiked ? prev + 1 : prev - 1));
    }
  };

  const handleCommentSubmit = async e => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmittingComment(true);
    try {
      const res = await api.post(`/vehicles/${vehicleId}/comments`, {
        text: newComment,
      });
      setComments(prev => [res.data.data.doc, ...prev]);
      setNewComment('');
      toast.success('Comment posted!');
    } catch (err) {
      toast.error('Failed to post comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSetCoverPhoto = async photoUrl => {
    if (vehicle.coverPhoto === photoUrl) return;
    const originalCover = vehicle.coverPhoto;
    setVehicle(prev => ({ ...prev, coverPhoto: photoUrl }));
    try {
      await api.patch(`/vehicles/${vehicleId}/set-cover`, {
        photoFilename: photoUrl,
      });
      toast.success('Cover photo updated!');
      fetchPageData();
    } catch (err) {
      setVehicle(prev => ({ ...prev, coverPhoto: originalCover }));
      toast.error('Failed to update cover photo.');
    }
  };

  const handleDeletePhoto = async photoId => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;
    try {
      await api.delete(`/photos/${photoId}`);
      toast.success('Photo deleted successfully!');
      fetchPageData();
    } catch (err) {
      toast.error('Failed to delete photo.');
    }
  };

  if (loading)
    return <p className="text-center p-10 font-semibold">Loading Vehicle...</p>;
  if (error) return <p className="text-center text-red-500 p-10">{error}</p>;
  if (!vehicle)
    return <p className="text-center p-10">No vehicle data found.</p>;

  // ✅ THIS IS THE FIX: isOwner and coverPhotoUrl are now calculated *after* the guards.
  const isOwner = loggedInUser && loggedInUser._id === vehicle.user;

  const coverPhotoUrl = vehicle.coverPhoto?.startsWith('http')
    ? vehicle.coverPhoto
    : `${import.meta.env.VITE_STATIC_FILES_URL}/img/photos/${
        vehicle.coverPhoto || 'default-vehicle.png'
      }`;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8">
      <div className="w-full aspect-video bg-gray-900 rounded-lg shadow-lg overflow-hidden">
        <img
          src={coverPhotoUrl}
          alt={`Main view of ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-contain"
        />
      </div>

      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h1>
        <div className="flex justify-center items-center gap-2 mt-2">
          <button
            onClick={handleLikeToggle}
            disabled={!loggedInUser}
            className="flex items-center gap-1 text-gray-600 hover:text-red-500 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-6 w-6 transition-colors ${
                isLiked ? 'text-red-500 fill-current' : 'text-gray-400'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
              />
            </svg>
            <span className="font-semibold">{likeCount}</span>
          </button>
        </div>
        {vehicle.garage && (
          <Link
            to={`/garages/${vehicle.garage._id}`}
            className="inline-flex items-center gap-2 text-lg font-semibold text-gray-600 hover:text-blue-700 transition group"
          >
            <ChevronLeftIcon className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            Back to {vehicle.garage.name}
          </Link>
        )}
      </div>

      {isOwner && (
        <div className="flex justify-center items-center gap-4 p-4 bg-gray-100 rounded-lg shadow-sm">
          <span className="font-semibold text-gray-700">Owner Controls:</span>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition"
          >
            Edit Details
          </button>
          <button
            onClick={handleDeleteVehicle}
            className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition"
          >
            Delete Vehicle
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold border-b pb-2 mb-3">
              Description
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {vehicle.description || 'No description provided.'}
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold border-b pb-2 mb-3">
              Owner's Story
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {vehicle.story || 'No story has been added for this vehicle.'}
            </p>
          </div>
        </div>
        <div className="md:col-span-1">
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-3">Vehicle Details</h2>
            <dl>
              <VehicleStat label="Make" value={vehicle.make} />
              <VehicleStat label="Model" value={vehicle.model} />
              <VehicleStat label="Year" value={vehicle.year} />
              <VehicleStat
                label="Condition"
                value={vehicle.condition || 'Not specified'}
              />
            </dl>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-2xl font-semibold">Photo Gallery</h2>
          {isOwner && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              + Add Photos
            </button>
          )}
        </div>
        {vehicle.photos && vehicle.photos.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {vehicle.photos.map((photo, i) => {
              const isCurrentCover = vehicle.coverPhoto === photo.photo;

              const photoUrl = photo.photo?.startsWith('http')
                ? photo.photo
                : `${import.meta.env.VITE_STATIC_FILES_URL}/img/photos/${
                    photo.photo || 'default-vehicle.png'
                  }`;

              return (
                <div
                  key={photo._id}
                  className="aspect-square group relative cursor-pointer"
                  onClick={() => setSelectedPhotoIndex(i)}
                >
                  <img
                    src={photoUrl}
                    alt={photo.caption || `Photo of ${vehicle.model}`}
                    className="w-full h-full object-cover rounded-lg shadow-md group-hover:opacity-75 transition-opacity"
                  />
                  {isOwner && (
                    <div
                      className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                      onClick={e => e.stopPropagation()}
                    >
                      {isCurrentCover ? (
                        <span className="text-white font-bold text-xs bg-green-600 px-2 py-1 rounded">
                          Cover
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetCoverPhoto(photo.photo)}
                          className="bg-blue-600 text-white font-bold py-1 px-3 rounded-lg hover:bg-blue-700 transition text-xs"
                        >
                          Make Cover
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePhoto(photo._id)}
                        className="bg-red-600 text-white font-bold py-1 px-3 rounded-lg hover:bg-red-700 transition text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">
            No photos have been uploaded for this vehicle yet.
          </p>
        )}
      </div>

      <div className="max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold mb-4">
          {comments.length} Comments
        </h3>
        {loggedInUser && (
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <input
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              disabled={isSubmittingComment}
              className="w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring focus:border-blue-400"
            />
            <button
              type="submit"
              disabled={isSubmittingComment || !newComment.trim()}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {isSubmittingComment ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        )}
        {/* --- THIS IS THE CORRECTED SECTION --- */}
        <div className="space-y-6">
          {comments.map(comment => {
            const avatarUrl =
              comment.user && comment.user.avatar?.startsWith('http')
                ? comment.user.avatar
                : `${import.meta.env.VITE_STATIC_FILES_URL}/img/users/${
                    comment.user?.avatar || 'default.jpg'
                  }`;

            return (
              <div key={comment._id} className="flex items-start space-x-4">
                <Link to={`/profile/${comment.user?._id}`}>
                  <img
                    src={avatarUrl}
                    alt={comment.user?.name || 'User avatar'}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </Link>
                <div className="flex-1 bg-gray-100 rounded-lg p-4">
                  <div className="font-semibold">
                    {comment.user?.name || 'User'}
                  </div>
                  <span className="text-xs text-gray-500 mb-1">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                  <p className="text-gray-800">{comment.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- Modals --- */}
      {isOwner && isUploadModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setIsUploadModalOpen(false)}
        >
          <div
            className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Upload New Photos</h2>
            <PhotoUpload
              vehicleId={vehicleId}
              onUploadSuccess={handleUploadSuccess}
            />
          </div>
        </div>
      )}
      {isOwner && isEditModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl"
            onClick={e => e.stopPropagation()}
          >
            <EditVehicleForm
              vehicle={vehicle}
              onUpdateSuccess={handleUpdateSuccess}
            />
          </div>
        </div>
      )}
      {selectedPhotoIndex !== null && vehicle && vehicle.photos && (
        <PhotoModal
          photos={vehicle.photos}
          currentIndex={selectedPhotoIndex}
          vehicleId={vehicle._id}
          onClose={() => setSelectedPhotoIndex(null)}
        />
      )}
    </div>
  );
}
