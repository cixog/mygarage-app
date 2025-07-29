import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const res = await api.post('/users/signup', formData);
      setSuccessMessage(res.data.message);
    } catch (err) {
      // Now, this will correctly catch errors like "Invalid email" or "User already exists"
      const msg =
        err.response?.data?.message || 'Signup failed. Please try again.';
      setError(msg);
      console.error('Signup error:', msg, err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-10 bg-white rounded-lg shadow-lg my-8">
      {successMessage ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-green-600">Success!</h2>
          <p className="text-gray-700">{successMessage}</p>
          <p className="mt-4 text-sm text-gray-500">
            You can now close this page.
          </p>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="password"
              name="passwordConfirm"
              placeholder="Confirm Password"
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
            {/* --- THIS IS THE FIX --- */}
            <button
              type="submit"
              disabled={isSubmitting} // 1. Add the disabled attribute
              className="btn w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed" // 2. Add disabled styling
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-sm text-center text-gray-600 mt-4">
            Already have an account?{' '}
            <Link to="/" className="text-blue-600 hover:underline">
              Log in here
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
