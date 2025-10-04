// client/src/pages/SearchResultsPage.jsx
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../api/api';
import GarageCard from '../components/GarageCard'; // Reuse your excellent component!
import GarageCardSkeleton from '../components/GarageCardSkeleton'; // For loading state

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState({ garages: [], users: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/search?q=${query}`);
        setResults(res.data.data);
      } catch (err) {
        console.error('Failed to fetch search results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]); // Re-run the search if the query in the URL changes

  const { garages, users } = results;
  const hasResults = !loading && (garages.length > 0 || users.length > 0);
  const noResults = !loading && garages.length === 0 && users.length === 0;

  // ✍️ 2. DEFINE DYNAMIC METADATA VARIABLES HERE
  const pageTitle = query
    ? `Search Results for "${query}" | MyGarage`
    : `Search MyGarage`;

  const pageDescription = query
    ? `Found ${garages.length} garages and ${users.length} users matching the search term "${query}".`
    : 'Search the MyGarage database for public car collections, vehicles, and community members.';

  return (
    // ✍️ 3. WRAP CONTENT IN FRAGMENT AND ADD HELMET
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {/* Canonical Link (important for dynamic pages to prevent indexing variations) */}
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="p-4">
        <h1 className="text-3xl font-bold mb-6">
          Search Results for "{query}"
        </h1>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <GarageCardSkeleton key={index} />
            ))}
          </div>
        )}

        {noResults && (
          <p className="text-center text-gray-500 py-10">
            No results found for your query.
          </p>
        )}

        {hasResults && (
          <div className="space-y-12">
            {/* Garage Results */}
            {garages.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
                  Garages
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {garages.map(garage => (
                    <GarageCard key={garage._id} garage={garage} />
                  ))}
                </div>
              </section>
            )}

            {/* User Results */}
            {users.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
                  Users
                </h2>
                <div className="space-y-4 max-w-lg">
                  {users.map(user => {
                    // ✅ THIS IS THE FIX: Add the conditional logic for the avatar URL.
                    const avatarUrl = user.avatar?.startsWith('http')
                      ? user.avatar
                      : `${import.meta.env.VITE_STATIC_FILES_URL}/img/users/${
                          user.avatar || 'default.jpg'
                        }`;

                    return (
                      <Link
                        key={user._id}
                        to={`/profile/${user._id}`}
                        className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <img
                          src={avatarUrl} // Use the corrected variable
                          alt={user.name}
                          className="w-12 h-12 rounded-full mr-4 object-cover"
                        />
                        <div>
                          <p className="font-bold text-gray-800">{user.name}</p>
                          <p className="text-sm text-gray-600">
                            {user.location || 'Location not set'}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  );
}
