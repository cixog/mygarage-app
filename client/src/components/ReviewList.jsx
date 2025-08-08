// client/src/components/ReviewList.jsx

import { useState, useEffect } from 'react';
import api from '../api/api';
import { Link } from 'react-router-dom';

export default function ReviewList({ garageId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!garageId) return;
      setLoading(true);
      try {
        const res = await api.get(`/garages/${garageId}/reviews`);
        setReviews(res.data.data.data); // Factory nests data twice
      } catch (err) {
        console.error('Failed to fetch reviews', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [garageId]); // Re-fetch if garageId changes

  if (loading) return <p>Loading reviews...</p>;

  if (reviews.length === 0) {
    return (
      <p className="text-gray-500 py-4">This garage has no reviews yet.</p>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map(review => (
        <div
          key={review._id}
          className="flex items-start space-x-4 p-4 border-b"
        >
          <Link to={`/profile/${review.user._id}`}>
            <img
              src={`${import.meta.env.VITE_STATIC_FILES_URL}/img/users/${
                review.user.avatar || 'default.jpg'
              }`}
              alt={review.user.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          </Link>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <Link
                to={`/profile/${review.user._id}`}
                className="font-bold hover:underline"
              >
                {review.user.name}
              </Link>
              <span className="text-yellow-500 font-bold">
                {'★'.repeat(review.rating)}
                {'☆'.repeat(5 - review.rating)}
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-2">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
            <p className="text-gray-800">{review.review}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
