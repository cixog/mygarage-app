// client/src/pages/Home.jsx (Corrected with Skeletons)

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

// Component Imports
import GarageCard from '../components/GarageCard';
import PhotoCard from '../components/PhotoCard';
import GarageCardSkeleton from '../components/GarageCardSkeleton';
import PhotoCardSkeleton from '../components/PhotoCardSkeleton';

export default function Home() {
  const { user } = useAuth();

  const [featuredGarages, setFeaturedGarages] = useState([]);
  const [newestGarages, setNewestGarages] = useState([]);
  const [recentPhotos, setRecentPhotos] = useState([]);
  const [followedFeed, setFollowedFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHomePageData = async () => {
      setLoading(true);
      setError('');
      try {
        // These parallel API calls fetch all the data we need.
        // The first call now relies on our new backend logic.
        const [featuredRes, newestRes, recentPhotosRes] = await Promise.all([
          api.get('/garages?sort=-ratingsAverage,-ratingsQuantity&limit=4'), // Corrected sort
          api.get('/garages?sort=-createdAt&limit=4'),
          api.get('/photos?sort=-createdAt&limit=8'),
        ]);

        setFeaturedGarages(featuredRes.data.data.data);
        setNewestGarages(newestRes.data.data.data);
        setRecentPhotos(recentPhotosRes.data.data.photos);

        if (user) {
          const feedRes = await api.get('/photos/feed');
          setFollowedFeed(feedRes.data.data.photos);
        }
      } catch (err) {
        console.error('Failed to fetch home page data:', err);
        setError('Could not load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomePageData();
  }, [user]); // This dependency array ensures data re-fetches on login/logout.

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
        {/* Garages You Follow (Conditional) */}
        {user && (
          <div>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Garages You Follow
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <PhotoCardSkeleton key={i} />
                  ))
                : followedFeed.map(photo => (
                    <PhotoCard key={photo._id} photo={photo} />
                  ))}
            </div>
          </div>
        )}

        {/* Featured Garages Section */}
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

        {/* Newest Garages Section */}
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

        {/* Recently Added Photos Section */}
        <div>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            Recently Added Photos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <PhotoCardSkeleton key={i} />
                ))
              : recentPhotos.map(photo => (
                  <PhotoCard key={photo._id} photo={photo} />
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
