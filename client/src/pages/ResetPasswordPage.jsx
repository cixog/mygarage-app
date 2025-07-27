// client/src/pages/ResetPasswordPage.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
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
      return toast.error('Passwords do not match!');
    }
    setIsSubmitting(true);
    try {
      const res = await api.patch(`/users/resetPassword/${token}`, formData);
      // The backend logs the user in automatically after a successful reset
      const { token: newToken, data } = res.data;
      localStorage.setItem('token', newToken);
      setUser(data.user);
      toast.success('Password has been reset successfully!');
      navigate('/profile');
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Failed to reset password. Token may be invalid or expired.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Reset Your Password
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          {isSubmitting ? 'Saving...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}
