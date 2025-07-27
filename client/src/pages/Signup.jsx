import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 1. Import useNavigate
import { useAuth } from '../context/AuthContext'; // 👈 2. Import useAuth
import api from '../api/api';

export default function Signup() {
  const navigate = useNavigate(); // 👈 3. Get the navigate function
  const { setUser } = useAuth(); // 👈 4. Get the setUser function from context

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [error, setError] = useState(''); // Good practice to show errors to the user

  const handleChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      // The API call is the same
      const res = await api.post('/users/signup', formData);

      // --- 👇 THIS IS THE NEW, CRITICAL LOGIC ---

      // 5. Get the token and user from the response
      const { token, data } = res.data;
      const user = data.user; // Note: Your backend login sends user inside data.user
      console.log('data.user(Sup)', user);
      // 6. Save the token and update the auth context
      localStorage.setItem('token', token);
      setUser(user);

      // 7. Redirect the user to the onboarding page
      console.log('Signup successful, navigating to onboarding...');
      navigate('/onboarding');
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Signup failed. Please try again.';
      setError(msg);
      console.error('Signup error:(Sup)', msg, error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-10 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
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
        <button
          type="submit"
          className="btn w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Create Account & Continue
        </button>
      </form>
    </div>
  );
}
