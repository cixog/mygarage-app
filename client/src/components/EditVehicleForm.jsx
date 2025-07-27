// Save as: client/src/components/EditVehicleForm.jsx

import { useState, useEffect } from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';

export default function EditVehicleForm({ vehicle, onUpdateSuccess }) {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    description: '',
    story: '',
    condition: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When the component loads or the vehicle data changes, pre-fill the form
  useEffect(() => {
    if (vehicle) {
      setFormData({
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || '',
        description: vehicle.description || '',
        story: vehicle.story || '',
        condition: vehicle.condition || '',
      });
    }
  }, [vehicle]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.patch(`/vehicles/${vehicle._id}`, formData);
      toast.success('Vehicle updated successfully!');
      if (onUpdateSuccess) {
        onUpdateSuccess(); // This will close the modal and refresh the data
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update vehicle.');
      console.error('Update error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Edit Vehicle Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          name="make"
          placeholder="Make"
          value={formData.make}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="text"
          name="model"
          placeholder="Model"
          value={formData.model}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="number"
          name="year"
          placeholder="Year"
          value={formData.year}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <input
        type="text"
        name="condition"
        placeholder="Condition (e.g., Excellent, Project)"
        value={formData.condition}
        onChange={handleChange}
        className="w-full border rounded px-3 py-2"
      />
      <textarea
        name="description"
        placeholder="A short description..."
        value={formData.description}
        onChange={handleChange}
        className="w-full border rounded px-3 py-2 h-24"
      />
      <textarea
        name="story"
        placeholder="The story behind the vehicle..."
        value={formData.story}
        onChange={handleChange}
        className="w-full border rounded px-3 py-2 h-32"
      />
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
