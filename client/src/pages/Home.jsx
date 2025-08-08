// client/src/pages/Home.jsx (Corrected and Final Version)

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

// Component Imports
import GarageCard from '../components/GarageCard';
import PhotoCard from '../components/PhotoCard';
import GarageCardSkeleton from '../components/GarageCardSkeleton';
import PhotoCardSkeleton from '../components/PhotoCardSkeleton';
import VehicleCard from '../components/VehicleCard';
import VehicleCardSkeleton from '../components/VehicleCardSkeleton';
import FollowPlaceholderCard from '../components/FollowPlaceholderCard'; // Assuming this file exists from our previous fix

export default function Home() {
  const { user } = useAuth();

  const [featuredGarages, setFeaturedGarages] = useState([]);
  const [newestGarages, setNewestGarages] = useState([]);
  const [latestVehicles, setLatestVehicles] = useState([]);

  const [followedGarages, setFollowedGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHomePageData = async () => {
      setLoading(true);
      setError('');
      try {
        const [featuredRes, newestRes, latestVehiclesRes] = await Promise.all([
          api.get('/garages/random?limit=4'),
          api.get('/garages?sort=-createdAt&limit=4'),
          api.get('/vehicles/latest?limit=8'),
        ]);

        setFeaturedGarages(featuredRes.data.data.data);
        setNewestGarages(newestRes.data.data.data);
        setLatestVehicles(latestVehiclesRes.data.data.data);

        if (user) {
          // ✅ CHANGE #2: Call the new API endpoint instead of the old one.
          const feedRes = await api.get('/users/me/followed-garages');
          setFollowedGarages(feedRes.data.data.data); // Set the new state
        }
      } catch (err) {
        console.error('Failed to fetch home page data:', err);
        setError('Could not load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomePageData();
  }, [user]);

  if (error) {
    return <div className="text-center text-red-500 p-10">{error}</div>;
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gray-100 px-4 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome to MyGarage
        </h1>
        <p className="text-lg text-gray-600">
          The premier community for showcasing car collections.
        </p>
      </div>

      {/* Content Wrapper */}
      <div className="max-w-6xl mx-auto py-8 px-4 space-y-12">
        {/* ✅ CHANGE #3: This whole JSX block is updated */}
        {user && (
          <div>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Garages You Follow
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading ? (
                // Use Garage skeletons for a consistent loading state
                Array.from({ length: 4 }).map((_, i) => (
                  <GarageCardSkeleton key={i} />
                ))
              ) : followedGarages.length > 0 ? (
                // Render a GarageCard for each item in our new state array
                followedGarages.map(garage => (
                  <GarageCard key={garage._id} garage={garage} />
                ))
              ) : (
                // The placeholder for an empty feed remains the same
                <FollowPlaceholderCard />
              )}
            </div>
          </div>
        )}

        {/* Featured Garages Section (Correct) */}
        <div>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            Featured Garages
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <GarageCardSkeleton key={i} />
                ))
              : featuredGarages.map(garage => (
                  <GarageCard key={garage._id} garage={garage} />
                ))}
          </div>
        </div>

        {/* Newest Garages Section (Correct) */}
        <div>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            Newest Garages
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <GarageCardSkeleton key={i} />
                ))
              : newestGarages.map(garage => (
                  <GarageCard key={garage._id} garage={garage} />
                ))}
          </div>
        </div>

        {/* The Latest Section (Correct - Renders VehicleCards) */}
        <div>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">The Latest</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <VehicleCardSkeleton key={i} />
                ))
              : latestVehicles.map(vehicle => (
                  <VehicleCard key={vehicle._id} vehicle={vehicle} />
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
