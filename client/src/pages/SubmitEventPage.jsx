// client/src/pages/SubmitEventPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import toast from 'react-hot-toast';

export default function SubmitEventPage() {
  const navigate = useNavigate();

  // --- 1. MODIFIED: The state object now includes 'category' ---
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    location: '',
    category: '', // Added for the category dropdown
    shortDescription: '',
    fullDescription: '',
  });

  // --- 2. NEW: State to hold the actual image file object ---
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- 3. NEW: A specific handler for the file input ---
  const handleFileChange = e => {
    setImageFile(e.target.files[0]); // We only care about the first file selected
  };

  // --- 4. MODIFIED: The handleSubmit function now sends multipart/form-data ---
  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    // To upload files, we MUST use the FormData object.
    // It correctly packages text fields and files into a single request.
    const submissionData = new FormData();

    // Append each key-value pair from our text form data state.
    for (const key in formData) {
      submissionData.append(key, formData[key]);
    }

    // If an image file was selected, append it to the form data.
    // The key 'photos' MUST match what the backend multer middleware expects.
    if (imageFile) {
      submissionData.append('photos', imageFile);
    }

    try {
      // The API call is now updated to send the FormData object.
      // We also must explicitly set the 'Content-Type' header.
      await api.post('/events/submit', submissionData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Event submitted for review. Thank you!');
      navigate('/events'); // Navigate to the events list page after success
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center">Submit an Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* --- Text Inputs (Unchanged) --- */}
        <input
          type="text"
          name="title"
          placeholder="Event Title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
        <div className="flex gap-4">
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <input
          type="text"
          name="location"
          placeholder="Location (e.g., City, Venue)"
          value={formData.location}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />

        {/* --- 5. NEW: Category Select Dropdown --- */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Event Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="mt-1 w-full border rounded px-3 py-2 bg-white"
          >
            <option value="" disabled>
              -- Please select a category --
            </option>
            <option value="Cars & Coffee">Cars & Coffee</option>
            <option value="Track Day">Track Day</option>
            <option value="Concours">Concours</option>
            <option value="Auction">Auction</option>
            <option value="Club Meetup">Club Meetup</option>
            <option value="Museum Exhibit">Museum Exhibit</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* --- Text Inputs (Unchanged) --- */}
        <input
          type="text"
          name="shortDescription"
          placeholder="Short Description (for summary cards)"
          value={formData.shortDescription}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
        <textarea
          name="fullDescription"
          placeholder="Full Event Details..."
          value={formData.fullDescription}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 h-32"
        />

        {/* --- 6. NEW: File Input for Image Upload --- */}
        <div className="border p-3 rounded-lg bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Image (Optional)
          </label>
          <input
            type="file"
            name="photo"
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/gif"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {imageFile && (
            <p className="text-xs text-gray-600 mt-2">
              Selected: {imageFile.name}
            </p>
          )}
        </div>

        {/* --- Buttons (Unchanged) --- */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      </form>
    </div>
  );
}
