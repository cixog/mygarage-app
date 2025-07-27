// client/src/components/UpdatePasswordForm.jsx
import { useState } from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';

export default function UpdatePasswordForm() {
  const [formData, setFormData] = useState({
    passwordCurrent: '',
    password: '',
    passwordConfirm: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      return toast.error('New passwords do not match!');
    }
    setIsSubmitting(true);
    try {
      await api.patch('/users/updateMyPassword', formData);
      toast.success('Password updated successfully!');
      // Clear form after successful submission
      setFormData({ passwordCurrent: '', password: '', passwordConfirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="password"
        name="passwordCurrent"
        placeholder="Current Password"
        value={formData.passwordCurrent}
        onChange={handleChange}
        required
        className="w-full border rounded px-3 py-2"
      />
      <input
        type="password"
        name="password"
        placeholder="New Password"
        value={formData.password}
        onChange={handleChange}
        required
        className="w-full border rounded px-3 py-2"
      />
      <input
        type="password"
        name="passwordConfirm"
        placeholder="Confirm New Password"
        value={formData.passwordConfirm}
        onChange={handleChange}
        required
        className="w-full border rounded px-3 py-2"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isSubmitting ? 'Saving...' : 'Save Password'}
      </button>
    </form>
  );
}
