// client/src/pages/EventDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Helmet from 'react-helmet';
import api from '../api/api';

export default function EventDetailPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/events/${eventId}`);
        setEvent(res.data.data.doc);
      } catch (err) {
        setError('Could not load event. It may not be available.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const formatDateRange = (start, end) => {
    const startDate = new Date(start).toLocaleDateString();
    const endDate = new Date(end).toLocaleDateString();
    return startDate === endDate ? startDate : `${startDate} to ${endDate}`;
  };

  if (loading) return <p className="text-center p-10">Loading Event...</p>;
  if (error) return <p className="text-center text-red-500 p-10">{error}</p>;
  if (!event) return null;

  // ✍️ 2. DEFINE DYNAMIC METADATA VARIABLES HERE
  // This executes only after 'event' is successfully loaded.
  const eventDateRange = formatDateRange(event.startDate, event.endDate);
  const pageTitle = `${event.title} | ${eventDateRange}`;
  // Use the short description for the meta description
  const pageDescription =
    event.shortDescription ||
    `Details and registration information for the automotive event: ${event.title}`;

  const garageName = event.createdBy?.garage?.name;

  return (
    // ✍️ 3. WRAP CONTENT IN FRAGMENT AND ADD HELMET
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {/* Open Graph Tags for social media sharing */}
        <meta property="og:title" content={event.title} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="article" />
        {/* Canonical Link */}
        <link rel="canonical" href={window.location.href} />

        {/* Optional: Add image if available for better sharing preview */}
        {event.image && <meta property="og:image" content={event.image} />}
      </Helmet>
      <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg">
        {/* --- 1. NEW: Conditionally render the event image --- */}
        {/* This block will only appear if the event document has an 'image' property. */}
        {event.image && (
          <div className="w-full aspect-video bg-gray-200 rounded-lg shadow-md overflow-hidden mb-6">
            <img
              // ✅ THIS IS THE FIX: Use the 'image' property directly.
              src={event.image}
              alt={`Promotional image for ${event.title}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* --- Rest of the component is unchanged --- */}
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{event.title}</h1>
        <div className="text-lg text-gray-600 mb-4 border-b pb-4">
          <p>
            <strong>When:</strong>{' '}
            {formatDateRange(event.startDate, event.endDate)}
          </p>
          <p>
            <strong>Where:</strong>{' '}
            {event.location
              ? `${event.location.address || 'Not specified'}, ${
                  event.location.city
                }, ${event.location.state}`
              : 'Not specified'}
          </p>
          <p>
            <strong>Online:</strong>{' '}
            {event.url ? (
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {event.url}
              </a>
            ) : (
              'Not specified'
            )}
          </p>
          {/* ✅ NEW: Attribution line */}
          {garageName && (
            <p className="text-sm text-gray-500 mt-2 text-right">
              Thanks for submitting:{' '}
              <span className="font-semibold">{garageName}</span>
            </p>
          )}
        </div>
        <div className="prose max-w-none mt-6">
          <p className="font-semibold">{event.shortDescription}</p>
          <p>{event.fullDescription}</p>
        </div>
      </div>
    </>
  );
}
