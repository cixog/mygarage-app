// client/src/pages/MapSearchPage.jsx
import { useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import api from '../api/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

// A simple pin icon for the map markers
const Pin = () => (
  <svg
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 000-5 2.5 2.5 0 000 5z"
      fill="#D32F2F"
    />
  </svg>
);

export default function MapSearchPage() {
  const [location, setLocation] = useState('');
  const [distance, setDistance] = useState('10'); // Default distance in miles
  const [results, setResults] = useState({ garages: [], events: [] });
  const [loading, setLoading] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const [viewport, setViewport] = useState({
    longitude: -98.5795, // Center of the US
    latitude: 39.8283,
    zoom: 3.5,
  });

  const handleSearch = async e => {
    e.preventDefault();
    if (!location) {
      toast.error('Please enter a location or zip code.');
      return;
    }
    setLoading(true);
    setSelectedMarker(null);
    try {
      const res = await api.get(`/search/nearby`, {
        params: { location, distance },
      });
      setResults(res.data.data);
      toast.success(
        `Found ${res.data.results} results within ${distance} miles.`
      );
      // Optional: Fly to the first result's location on the map
      const firstResult = res.data.data.garages[0] || res.data.data.events[0];
      if (firstResult) {
        setViewport({
          ...viewport,
          longitude: firstResult.location.coordinates[0],
          latitude: firstResult.location.coordinates[1],
          zoom: 10,
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Search failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h1 className="text-3xl font-bold">Find Garages & Events Nearby</h1>
        <p className="text-gray-600">
          Enter a zip code or city to get started.
        </p>
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-4 mt-4"
        >
          <input
            type="text"
            placeholder="Enter Zip Code, City, or Address"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full sm:w-1/2 border rounded px-3 py-2"
          />
          <select
            value={distance}
            onChange={e => setDistance(e.target.value)}
            className="w-full sm:w-auto border rounded px-3 py-2 bg-white"
          >
            <option value="5">5 miles</option>
            <option value="10">10 miles</option>
            <option value="25">25 miles</option>
            <option value="50">50 miles</option>
            <option value="100">100 miles</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="btn bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
        <Map
          {...viewport}
          onMove={evt => setViewport(evt.viewState)}
          mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
          mapStyle="mapbox://styles/mapbox/streets-v11"
        >
          {results.garages.map(garage => (
            <Marker
              key={`garage-${garage._id}`}
              longitude={garage.location.coordinates[0]}
              latitude={garage.location.coordinates[1]}
              onClick={() =>
                setSelectedMarker({ type: 'garage', data: garage })
              }
            >
              <Pin />
            </Marker>
          ))}

          {/* You can add markers for events with a different color/icon if you wish */}

          {selectedMarker && (
            <Popup
              longitude={selectedMarker.data.location.coordinates[0]}
              latitude={selectedMarker.data.location.coordinates[1]}
              onClose={() => setSelectedMarker(null)}
              closeOnClick={false}
              anchor="left"
            >
              <div>
                <h3 className="font-bold">
                  <Link
                    to={`/garages/${selectedMarker.data._id}`}
                    className="hover:underline"
                  >
                    {selectedMarker.data.name}
                  </Link>
                </h3>
                <p className="text-sm">
                  {selectedMarker.data.location.address}
                </p>
              </div>
            </Popup>
          )}
        </Map>
      </div>
    </div>
  );
}
