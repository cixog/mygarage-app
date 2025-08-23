// client/src/components/LoginModal.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// --- THIS IS THE FIX ---
// Ensure the function is exported as the default for this module.
export default function LoginModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form state when the modal is closed
  useEffect(() => {
    if (!isOpen) {
      setFormData({ email: '', password: '' });
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleEsc = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setIsSubmitting(true);
    try {
      // This will now succeed or fail without a redirect
      await login(formData.email, formData.password);
      toast.success('Login successful!');
      onClose(); // Close modal ON SUCCESS
      navigate('/profile'); // Navigate ON SUCCESS
    } catch (err) {
      // THIS BLOCK IS NOW THE FINAL DESTINATION FOR LOGIN ERRORS
      const msg =
        err.response?.data?.message || 'Login failed. Check your credentials.';
      setError(msg); // The error message is set to state...
    } finally {
      setIsSubmitting(false);
    }
  };

  // Do not render anything if the modal is not open
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-60"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-md p-6 bg-white rounded-xl shadow-xl">
        <div className="text-center mb-4">
          <h1 className="text-5xl font-bold text-blue-600">TourMyGarage</h1>
        </div>

        <h2 className="text-xl font-semibold text-center mb-2">Log in</h2>

        <p className="text-sm text-center text-gray-600 mb-4">
          Not registered with TourMyGarage?{' '}
          <Link
            to="/signup"
            onClick={onClose}
            className="text-blue-600 hover:underline"
          >
            Sign up here
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email-modal"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email-modal"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password-modal"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password-modal"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="text-right">
            <Link
              to="/forgot-password"
              onClick={onClose}
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row-reverse justify-between gap-4 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {isSubmitting ? 'Logging in...' : 'Log In'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
