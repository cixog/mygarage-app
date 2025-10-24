// client/src/pages/Onboarding.jsx (Simplified Location Input)

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Onboarding() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    garageName: '',
    // 👈 CHANGE 1: Use 'location' to hold the *single* user input (City, State, or Full Address)
    location: '',
    about: '',
  });
  // ❌ Removed: isPublicAddress, fullStreetAddress
  const [avatarFile, setAvatarFile] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = e => {
    setAvatarFile(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // --- VALIDATION ---
    // Only check for the simplified 'location' input
    if (!formData.garageName || !formData.location || !formData.about) {
      setError('Garage Name, Location, and a description are required.');
      setIsSubmitting(false);
      return;
    }

    // --- BUILD FORM DATA ---
    const submissionData = new FormData();
    submissionData.append('garageName', formData.garageName);
    submissionData.append('about', formData.about);

    // 👈 CRITICAL: The *single* input is sent as BOTH 'location' (for user model) and 'address' (for geocoding)
    submissionData.append('location', formData.location);
    submissionData.append('address', formData.location); // Use the same string for geocoding

    // ❌ Removed: isPublicAddress conditional logic

    if (avatarFile) {
      submissionData.append('avatar', avatarFile);
    }

    try {
      const res = await api.post('/users/complete-onboarding', submissionData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Your garage has been created!');
      const updatedUser = res.data.data.user;
      setUser(updatedUser);

      const newGarageId = updatedUser.garage._id || updatedUser.garage;
      navigate(`/garages/${newGarageId}`, { state: { isNewUser: true } });
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Setup failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-10 bg-white rounded-lg shadow-md my-8">
      <h2 className="text-3xl font-bold mb-2 text-center">Build Your Garage</h2>
      <p className="text-gray-600 mb-6 text-center">
        This is the public profile where you'll showcase your collection.
      </p>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="garageName"
          placeholder="Garage Name (e.g., John's Classic Muscle)"
          value={formData.garageName}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
        {/* 👈 MODIFIED: Single Location Input with Privacy Note */}
        <input
          type="text"
          name="location"
          placeholder="Location (e.g., Austin, TX or 123 Main St, Anytown, US)"
          value={formData.location}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
        <p className="text-xs text-gray-500 mt-1">
          Tip: Only include the level of detail you want public (e.g., City,
          State, or Full Address).
        </p>
        {/* ❌ Removed: isPublicAddress checkbox and conditional street address */}
        <textarea
          name="about"
          placeholder="Tell the story behind your collection..."
          value={formData.about}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 h-24"
        />
        <div className="border p-3 rounded-lg bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profile Picture (Optional)
          </label>
          <input
            type="file"
            name="avatar"
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/gif"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Building...' : 'Finish & View My Garage'}
        </button>
      </form>
    </div>
  );
}
