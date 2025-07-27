// client/src/components/AddVehicleForm.jsx (Updated to include file uploads)

import { useState } from 'react';
import api from '../api/api';

export default function AddVehicleForm({ onVehicleAdded }) {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    description: '',
  });
  // --- NEW: State for the photo files ---
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- NEW: Handler for file input change ---
  const handleFileChange = e => {
    setPhotos(Array.from(e.target.files));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!formData.make || !formData.model || !formData.year) {
      setError('Make, Model, and Year are required.');
      setIsSubmitting(false);
      return;
    }

    // --- CRITICAL: Use FormData for file uploads ---
    const submissionData = new FormData();
    submissionData.append('make', formData.make);
    submissionData.append('model', formData.model);
    submissionData.append('year', formData.year);
    submissionData.append('description', formData.description);

    // Append each photo file
    photos.forEach(photo => {
      submissionData.append('photos', photo);
    });

    try {
      // The endpoint remains the same, but the backend will be updated to handle it.
      await api.post('/vehicles', submissionData, {
        headers: {
          'Content-Type': 'multipart/form-data', // This header is essential!
        },
      });

      // If successful, call the function passed in props
      if (onVehicleAdded) {
        onVehicleAdded();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to add vehicle. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Existing Text Inputs */}
      <input
        type="text"
        name="make"
        placeholder="Make (e.g., Ford)"
        value={formData.make}
        onChange={handleChange}
        required
        className="w-full border rounded px-3 py-2"
      />
      <input
        type="text"
        name="model"
        placeholder="Model (e.g., Mustang)"
        value={formData.model}
        onChange={handleChange}
        required
        className="w-full border rounded px-3 py-2"
      />
      <input
        type="number"
        name="year"
        placeholder="Year (e.g., 1969)"
        value={formData.year}
        onChange={handleChange}
        required
        className="w-full border rounded px-3 py-2"
      />
      <textarea
        name="description"
        placeholder="A short description of the vehicle..."
        value={formData.description}
        onChange={handleChange}
        className="w-full border rounded px-3 py-2"
      />

      {/* --- NEW: File Input Section --- */}
      <div className="border p-3 rounded-lg bg-gray-50">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Add Photos (Optional)
        </label>
        <input
          type="file"
          name="photos"
          multiple
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/gif"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="text-xs text-gray-500 mt-1">
          You can select multiple photos.
        </p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isSubmitting ? 'Adding...' : 'Add Vehicle'}
      </button>
    </form>
  );
}
