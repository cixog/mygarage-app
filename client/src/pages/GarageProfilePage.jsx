// client/src/pages/GarageProfilePage.jsx

import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Component Imports
import AddVehicleForm from '../components/AddVehicleForm';
import AddReviewForm from '../components/AddReviewForm';
import ReviewList from '../components/ReviewList';
import EditGarageForm from '../components/EditGarageForm';
import WelcomePrompt from '../components/WelcomePrompt';

export default function GarageProfilePage() {
  const { garageId } = useParams();
  const { user: loggedInUser, setUser } = useAuth();
  const location = useLocation();
  const isNewUser = location.state?.isNewUser;

  // Page Data State
  const [garageData, setGarageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal and Interaction State
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [isEditGarageModalOpen, setIsEditGarageModalOpen] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewListKey, setReviewListKey] = useState(Date.now());
  const [isFollowing, setIsFollowing] = useState(false);

  const [showWelcomePrompt, setShowWelcomePrompt] = useState(isNewUser);
  const addVehicleButtonRef = useRef(null);

  const fetchGarage = async () => {
    if (!garageId) return;
    setLoading(true);
    try {
      const res = await api.get(`/garages/${garageId}`);
      setGarageData(res.data.data.garage);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch garage:', err);
      setError('Could not load garage. The user or garage may not exist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGarage();
  }, [garageId]);

  useEffect(() => {
    if (!loggedInUser || !garageData?.user) {
      setIsFollowing(false);
      return;
    }
    const currentlyFollowing =
      loggedInUser.following?.some(followedItem => {
        if (typeof followedItem === 'string') {
          return followedItem === garageData.user._id;
        }
        return followedItem._id === garageData.user._id;
      }) || false;
    setIsFollowing(currentlyFollowing);
  }, [loggedInUser, garageData]);

  const handleFollowToggle = async () => {
    if (!loggedInUser || !garageData?.user) return;

    const userIdToFollow = garageData.user._id;
    const originalIsFollowing = isFollowing;
    setIsFollowing(!originalIsFollowing);

    try {
      if (originalIsFollowing) {
        await api.post(`/users/unfollow/${userIdToFollow}`);
        setUser(prevUser => ({
          ...prevUser,
          following: prevUser.following.filter(item => {
            const itemId = typeof item === 'string' ? item : item._id;
            return itemId !== userIdToFollow;
          }),
        }));
        toast.success(`Unfollowed ${garageData.user.name}`);
      } else {
        await api.post(`/users/follow/${userIdToFollow}`);
        setUser(prevUser => ({
          ...prevUser,
          following: [...prevUser.following, userIdToFollow],
        }));
        toast.success(`Now following ${garageData.user.name}`);
      }
    } catch (err) {
      console.error('Follow/Unfollow Error:', err);
      toast.error('Failed to update follow status.');
      setIsFollowing(originalIsFollowing);
    }
  };

  const handleGarageUpdateSuccess = () => {
    setIsEditGarageModalOpen(false);
    fetchGarage();
  };

  const handleVehicleAdded = () => {
    setIsAddVehicleModalOpen(false);
    fetchGarage();
  };

  const handleReviewAdded = () => {
    setShowReviewForm(false);
    setReviewListKey(Date.now());
  };

  if (loading) return <p className="text-center p-10">Loading Garage...</p>;
  if (error) return <p className="text-center text-red-500 p-10">{error}</p>;
  if (!garageData || !garageData.user)
    return (
      <p className="text-center text-red-500 p-10">Garage data is missing.</p>
    );

  const avatarUrl = garageData.user.avatar?.startsWith('http')
    ? garageData.user.avatar
    : `${import.meta.env.VITE_STATIC_FILES_URL}/img/users/${
        garageData.user.avatar || 'default.jpg'
      }`;

  const isOwner = loggedInUser && loggedInUser._id === garageData.user._id;
  const followerCount = garageData?.user?.followers?.length || 0;

  // --- THIS IS THE FIX (Part 1) ---
  // We create a new formatted date string before rendering.
  // The user.createdAt field comes from the `getGarage` controller's population.
  const joinDate = new Date(garageData.user.createdAt).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'short',
    }
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 mb-8 p-6 bg-white rounded-lg shadow-md">
        <img
          src={avatarUrl}
          alt={`${garageData.user.name}'s avatar`}
          className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
        />
        <div className="text-center md:text-left flex-grow">
          <h1 className="text-4xl font-bold text-gray-800">
            {garageData.name}
          </h1>
          <p className="text-xl text-gray-600">
            Owned by{' '}
            <span className="font-semibold">{garageData.user.name}</span>
          </p>

          {/* We add the new `joinDate` variable to this metadata section. */}
          <div className="flex justify-center md:justify-start items-center gap-x-3 text-sm text-gray-500 mt-2">
            <span>
              Followed by <span className="font-bold">{followerCount}</span>{' '}
              {followerCount === 1 ? 'user' : 'users'}
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Joined {joinDate}</span>
          </div>
          <p className="text-gray-700 mt-2 max-w-xl">
            {garageData.description || 'No description provided.'}
          </p>
        </div>
        <div className="flex-shrink-0">
          {loggedInUser && !isOwner && (
            <button
              onClick={handleFollowToggle}
              className={`font-bold py-2 px-6 rounded-lg transition w-32 ${
                isFollowing
                  ? 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
          {isOwner && (
            <button
              onClick={() => setIsEditGarageModalOpen(true)}
              className="font-bold py-2 px-6 rounded-lg transition bg-yellow-500 text-white hover:bg-yellow-600"
            >
              Edit Garage
            </button>
          )}
        </div>
      </div>

      {/* The rest of the file remains the same... */}
      {/* Vehicle Collection Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800">
            Vehicle Collection ({garageData.vehicles?.length || 0})
          </h2>
          {isOwner && (
            <button
              ref={addVehicleButtonRef}
              onClick={() => setIsAddVehicleModalOpen(true)}
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              + Add Vehicle
            </button>
          )}
        </div>
        {garageData.vehicles && garageData.vehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {garageData.vehicles.map(vehicle => (
              <Link
                to={`/vehicles/${vehicle._id}`}
                key={vehicle._id}
                className="block group"
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden transform group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={
                      vehicle.coverPhoto?.startsWith('http')
                        ? vehicle.coverPhoto
                        : `${
                            import.meta.env.VITE_STATIC_FILES_URL
                          }/img/photos/${
                            vehicle.coverPhoto || 'default-vehicle.png'
                          }`
                    }
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    className="w-full h-56 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">
              {isOwner
                ? 'Your garage is empty. Add your first vehicle!'
                : 'This garage has no vehicles yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800">Reviews</h2>
          {loggedInUser && !isOwner && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition"
            >
              + Add Your Review
            </button>
          )}
        </div>
        {showReviewForm && (
          <div className="mb-8">
            <AddReviewForm
              garageId={garageId}
              onReviewAdded={handleReviewAdded}
            />
            <button
              onClick={() => setShowReviewForm(false)}
              className="text-sm text-gray-600 mt-2 hover:underline"
            >
              Cancel
            </button>
          </div>
        )}
        <ReviewList key={reviewListKey} garageId={garageId} />
      </div>

      {/* Modals and Welcome Prompt... */}
      {isOwner && isAddVehicleModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setIsAddVehicleModalOpen(false)}
        >
          <div
            className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Add a New Vehicle</h2>
            <AddVehicleForm onVehicleAdded={handleVehicleAdded} />
          </div>
        </div>
      )}

      {isOwner && isEditGarageModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setIsEditGarageModalOpen(false)}
        >
          <div
            className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg"
            onClick={e => e.stopPropagation()}
          >
            <EditGarageForm
              garage={garageData}
              onUpdateSuccess={handleGarageUpdateSuccess}
            />
          </div>
        </div>
      )}

      {showWelcomePrompt && isOwner && (
        <WelcomePrompt
          targetRef={addVehicleButtonRef}
          onClose={() => setShowWelcomePrompt(false)}
        />
      )}
    </div>
  );
}
