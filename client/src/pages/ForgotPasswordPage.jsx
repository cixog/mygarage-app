// client/src/pages/ForgotPasswordPage.jsx
import { useState } from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/users/forgotPassword', { email });
      toast.success(
        'If an account exists, a password reset link has been sent to your email.'
      );
      setEmail('');
    } catch (err) {
      console.log(err);
      // Still show a generic success message for security reasons
      toast.success(
        'If an account exists, a password reset link has been sent to your email.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>
      <p className="text-center text-gray-600 mb-6">
        Enter your email address and we'll send you a link to reset your
        password.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Your Email Address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
}
