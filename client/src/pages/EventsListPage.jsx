// client/src/pages/EventsListPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function EventsListPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // To conditionally show the submit button
  const navigate = useNavigate();

  // --- 1. STATE FOR FILTERS ---
  // This object will hold the current values of our search and category filters.
  const [filters, setFilters] = useState({
    search: '',
    category: '',
  });

  // --- 2. MODIFIED useEffect HOOK ---
  // This hook now re-runs whenever the `filters` state changes.
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // Use URLSearchParams to safely build the query string (e.g., "?category=Track+Day")
        const params = new URLSearchParams();

        if (filters.search) {
          // Use [regex] for partial matching on the backend. Your APIFeatures setup handles this.
          params.append('title[regex]', filters.search);
          params.append('title[options]', 'i'); // Case-insensitive search
        }
        if (filters.category) {
          params.append('category', filters.category);
        }

        const res = await api.get(`/events?${params.toString()}`);
        setEvents(res.data.data.data);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };

    // Use a timeout to prevent an API call on every single keystroke.
    // This is called "debouncing" and is a best practice for search inputs.
    const searchTimeout = setTimeout(() => {
      fetchEvents();
    }, 500); // Wait 500ms after the user stops typing to fetch.

    // Cleanup function: If the user types again, clear the previous timeout.
    return () => clearTimeout(searchTimeout);
  }, [filters]); // The dependency array ensures this effect runs when `filters` changes.

  // --- 3. HANDLER FOR FILTER INPUTS ---
  // This function updates the `filters` state when the user types or selects a new category.
  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const formatDateRange = (startDateStr, endDateStr) => {
    const options = { month: 'short', day: 'numeric' };
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    // If the dates are the same, just show one.
    if (startDate.toDateString() === endDate.toDateString()) {
      return startDate.toLocaleDateString('en-US', options);
    }

    // If the dates are in the same month, show as "Aug 25 - 26"
    if (startDate.getMonth() === endDate.getMonth()) {
      const startDay = startDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const endDay = endDate.toLocaleDateString('en-US', { day: 'numeric' });
      return `${startDay}-${endDay}`;
    }

    // Otherwise, show the full range "Aug 31 - Sep 2"
    const startFormat = startDate.toLocaleDateString('en-US', options);
    const endFormat = endDate.toLocaleDateString('en-US', options);
    return `${startFormat} - ${endFormat}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header section (Unchanged) */}
      <div className="flex justify-between items-center mb-6 pb-2 border-b">
        <h1 className="text-4xl font-bold">Upcoming Events</h1>
        {user && (
          <button
            onClick={() => navigate('/events/submit')}
            className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition"
          >
            + Submit an Event
          </button>
        )}
      </div>

      {/* --- 4. NEW: FILTER AND SEARCH UI --- */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
        <input
          type="text"
          name="search"
          placeholder="Search by event name..."
          value={filters.search}
          onChange={handleFilterChange}
          className="w-full sm:w-2/3 border rounded px-3 py-2"
        />
        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="w-full sm:w-1/3 border rounded px-3 py-2 bg-white"
        >
          <option value="">All Categories</option>
          <option value="Car/Truck/Bike Show">Car/Truck/Bike Show</option>
          <option value="Cars & Coffee">Cars & Coffee</option>
          <option value="Track Day">Track Day</option>
          <option value="Concours">Concours</option>
          <option value="Auction">Auction</option>
          <option value="Club Meetup">Club Meetup</option>
          <option value="Museum Exhibit">Museum Exhibit</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* --- MODIFIED DISPLAY LOGIC --- */}
      {loading ? (
        <p className="text-center p-10">Loading events...</p>
      ) : events.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md border">
          {events.map(event => (
            <Link
              key={event._id}
              to={`/events/${event._id}`}
              className="block px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
            >
              <div className="flex items-center">
                <span className="font-semibold text-sm text-blue-600 w-20">
                  {formatDateRange(event.startDate, event.endData)}
                </span>
                <span className="ml-4 font-medium text-gray-800">
                  {event.title}
                </span>
                <span className="ml-auto text-sm text-gray-500">
                  {event.location?.address || ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        // This message now correctly reflects that filters might be active.
        <p className="text-center text-gray-500 py-10">
          No events found that match your criteria.
        </p>
      )}
    </div>
  );
}
