// client/src/components/UpdateProfileForm.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import toast from 'react-hot-toast';

export default function UpdateProfileForm() {
  const { user, refreshUser } = useAuth();

  // Initialize state with empty strings to prevent controlled/uncontrolled input warnings
  const [formData, setFormData] = useState({ name: '', bio: '', location: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This hook syncs the form state with the user data when it loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
      });
    }
  }, [user]); // The dependency array ensures this runs when 'user' is updated.

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = e => {
    setAvatarFile(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    const submissionData = new FormData();
    submissionData.append('name', formData.name);
    submissionData.append('bio', formData.bio);
    submissionData.append('location', formData.location);
    if (avatarFile) {
      submissionData.append('avatar', avatarFile);
    }
    try {
      await api.patch('/users/updateMe', submissionData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await refreshUser(); // This re-fetches the user data for the whole app
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="name"
        placeholder="Your Name"
        value={formData.name}
        onChange={handleChange}
        required
        className="w-full border rounded px-3 py-2"
      />
      <textarea
        name="bio"
        placeholder="A short bio..."
        value={formData.bio}
        onChange={handleChange}
        className="w-full border rounded px-3 py-2 h-24"
      />
      <input
        type="text"
        name="location"
        placeholder="Your Location"
        value={formData.location}
        onChange={handleChange}
        className="w-full border rounded px-3 py-2"
      />
      <div className="border p-3 rounded-lg bg-gray-50">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Update Profile Picture (Optional)
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
        {isSubmitting ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}
