import { useState, useEffect } from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';

export default function EditGarageForm({ garage, onUpdateSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '', // This will now hold just the address string
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill the form when the component mounts
  useEffect(() => {
    if (garage) {
      setFormData({
        name: garage.name || '',
        description: garage.description || '',
        // ✅ THIS IS THE FIX (Part 1): We now access the 'address' property of the location object.
        // Optional chaining (?.) prevents an error if garage.location doesn't exist.
        location: garage.location?.address || '',
      });
    }
  }, [garage]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // ✅ THIS IS THE FIX (Part 2): The API call now sends a clean payload,
      // and the backend will be updated to handle it correctly.
      await api.patch('/garages/my-garage', formData);
      toast.success('Garage updated successfully!');

      // This function call (which closes the modal) will now be reached.
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update garage.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Edit Garage Information</h2>
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Garage Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="mt-1 w-full border rounded px-3 py-2 h-24"
        />
      </div>
      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-gray-700"
        >
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="mt-1 w-full border rounded px-3 py-2"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
