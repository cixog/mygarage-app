// client/src/components/AddReviewForm.jsx

import { useState } from 'react';
import api from '../api/api';

export default function AddReviewForm({ garageId, onReviewAdded }) {
  const [rating, setRating] = useState('');
  const [review, setReview] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await api.post(`/garages/${garageId}/reviews`, {
        rating: Number(rating),
        review,
      });
      // Call the parent component's callback function
      if (onReviewAdded) {
        onReviewAdded();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border rounded-lg bg-gray-50 space-y-4"
    >
      <h3 className="text-xl font-semibold">Write a Review</h3>
      <div>
        <label
          htmlFor="rating"
          className="block text-sm font-medium text-gray-700"
        >
          Rating
        </label>
        <input
          id="rating"
          type="number"
          min="1"
          max="5"
          placeholder="1 - 5"
          value={rating}
          onChange={e => setRating(e.target.value)}
          required
          className="mt-1 w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label
          htmlFor="review"
          className="block text-sm font-medium text-gray-700"
        >
          Review
        </label>
        <textarea
          id="review"
          value={review}
          onChange={e => setReview(e.target.value)}
          placeholder="Share your thoughts about this garage..."
          required
          className="mt-1 w-full border rounded px-3 py-2 h-24"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:bg-gray-400"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
