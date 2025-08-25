// client/src/pages/EventDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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

  return (
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
          <strong>Where:</strong> {event.location?.address || 'Not specified'}
        </p>
        <p>
          <strong>Online:</strong> {event.url || 'Not specified'}
        </p>
      </div>
      <div className="prose max-w-none mt-6">
        <p className="font-semibold">{event.shortDescription}</p>
        <p>{event.fullDescription}</p>
      </div>
    </div>
  );
}
