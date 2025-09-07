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
    console.log('VerifyEmailPage mounted. Token from URL:', token); // NEW LOG 1

    if (!token) {
      setStatus('No verification token found.');
      console.log('VerifyEmailPage: No token found, setting status.'); // NEW LOG 2
      return;
    }

    const verify = async () => {
      try {
        console.log('VerifyEmailPage: Initiating API call to verify-email.'); // NEW LOG 3
        const res = await api.get(`/users/verify-email/${token}`);
        const { token: authToken, data } = res.data;

        console.log(
          'VerifyEmailPage: API call successful, response:',
          res.data
        ); // NEW LOG 4

        // Log the user in
        localStorage.setItem('token', authToken);
        setUser(data.user);

        toast.success('Account verified successfully! Welcome!');

        // Redirect to onboarding or profile
        if (data.user.garage) {
          console.log(
            'VerifyEmailPage: User has garage, navigating to:',
            `/garages/${data.user.garage._id || data.user.garage}`
          ); // NEW LOG 5
          navigate(`/garages/${data.user.garage._id || data.user.garage}`);
        } else {
          console.log(
            'VerifyEmailPage: User has no garage, navigating to /onboarding.'
          ); // NEW LOG 6
          navigate('/onboarding');
        }
      } catch (err) {
        console.error('VerifyEmailPage: API call failed!', err); // NEW LOG 7
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
