// client/src/components/UpdateEmailForm.jsx
import { useState, useEffect } from 'react'; // 1. Import useEffect
import api from '../api/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function UpdateEmailForm() {
  const { user, setUser } = useAuth();

  // 2. Initialize state with empty strings.
  const [formData, setFormData] = useState({
    email: '',
    passwordCurrent: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 3. This useEffect hook syncs the form state with the user data.
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.email || !formData.passwordCurrent) {
      return toast.error('Please fill out all fields.');
    }
    setIsSubmitting(true);
    try {
      const res = await api.patch('/users/updateMyEmail', formData);
      const { token, data } = res.data;

      localStorage.setItem('token', token);
      setUser(data.user);

      toast.success('Email updated successfully!');
      // Reset the password field after a successful submission
      setFormData(prev => ({ ...prev, passwordCurrent: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        name="email"
        placeholder="New Email"
        value={formData.email}
        onChange={handleChange}
        required
        className="w-full border rounded px-3 py-2"
      />
      <input
        type="password"
        name="passwordCurrent"
        placeholder="Confirm with Current Password"
        value={formData.passwordCurrent}
        onChange={handleChange}
        required
        className="w-full border rounded px-3 py-2"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isSubmitting ? 'Saving...' : 'Save Email'}
      </button>
    </form>
  );
}
