// client/src/pages/AllGarages.jsx (Further modifications)

import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../api/api';
import GarageCard from '../components/GarageCard';
import GarageCardSkeleton from '../components/GarageCardSkeleton';

const AllGarages = () => {
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // 👈 1. ADD state for search
  const [sortBy, setSortBy] = useState('-createdAt'); // 👈 2. ADD state for sorting (default to newest)

  // ✍️ 3. MODIFY the useEffect hook to depend on search and sort states
  useEffect(() => {
    const fetchGarages = async () => {
      setLoading(true);
      try {
        // Build the query string dynamically
        const params = new URLSearchParams();
        if (searchTerm) {
          // Note: Your current APIFeatures doesn't support a general text search.
          // We are pretending it does for now and will add it to the backend next.
          // Let's search by name for now.
          params.append('name[regex]', searchTerm);
          params.append('name[options]', 'i'); // Case-insensitive
        }
        if (sortBy) {
          params.append('sort', sortBy);
        }

        const res = await api.get(`/garages?${params.toString()}`);
        setGarages(res.data.data.data || []);
      } catch (err) {
        console.error('Error loading garages:', err);
      } finally {
        setLoading(false);
      }
    };

    // We use a timeout to avoid sending an API request on every keystroke
    const searchTimeout = setTimeout(() => {
      fetchGarages();
    }, 500); // 500ms debounce

    return () => clearTimeout(searchTimeout); // Cleanup timeout on re-render
  }, [searchTerm, sortBy]); // Re-run effect when these values change

  return (
    // ✍️ CORRECTION: Wrap both Helmet and the main content in a Fragment (<>...</>)
    <>
      <Helmet>
        <title>All Public Garages | MyGarage Community</title>
        <meta
          name="description"
          content="Browse car collections by make, model, and year from our community members. Discover custom rides, project cars, and unique collections on MyGarage."
        />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      {/* The main content div is now a sibling to Helmet, inside the Fragment */}
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="pb-4 mb-4 border-b border-gray-200">
          <h1 className="text-4xl font-bold">Just let me see garages...</h1>
          <p className="mt-1 text-lg text-gray-600">
            Browse all public collections from our community.
          </p>
        </div>

        {/* ✍️ 4. ADD the search and sort UI controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by garage name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full sm:w-1/2 border rounded px-3 py-2"
          />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="w-full sm:w-auto border rounded px-3 py-2 bg-white"
          >
            <option value="-createdAt">Sort by Newest</option>
            <option value="createdAt">Sort by Oldest</option>
            <option value="-vehicleCount">Sort by Most Vehicles</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <GarageCardSkeleton key={index} />
            ))}
          </div>
        ) : garages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {garages.map(garage => (
              <GarageCard key={garage._id} garage={garage} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">
            No garages found that match your criteria.
          </p>
        )}
      </div>
    </> // ✍️ Closing Fragment tag
  );
};

export default AllGarages;
