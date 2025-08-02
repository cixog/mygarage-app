// client/src/pages/VerifyEmailPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [status, setStatus] = useState('Verifying your account...');

  useEffect(() => {
    if (!token) {
      setStatus('No verification token found.');
      return;
    }

    const verify = async () => {
      try {
        const res = await api.get(`/users/verify-email/${token}`);
        const { token: authToken, data } = res.data;

        // Log the user in
        localStorage.setItem('token', authToken);
        setUser(data.user);

        toast.success('Account verified successfully! Welcome!');

        // Redirect to onboarding or profile
        if (data.user.garage) {
          navigate(`/garages/${data.user.garage._id || data.user.garage}`);
        } else {
          navigate('/onboarding');
        }
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          'Verification failed. The link may be expired.';
        setStatus(msg);
        toast.error(msg);
      }
    };

    verify();
  }, [token, navigate, setUser]);

  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold">Email Verification</h1>
      <p className="text-lg text-gray-600 mt-4">{status}</p>
    </div>
  );
}
