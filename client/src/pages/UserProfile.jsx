// client/src/pages/UserProfile.jsx (Corrected and Final Version)
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

export default function UserProfileRedirect() {
  const { userId } = useParams();
  const { user: loggedInUser, loading: authLoading } = useAuth(); // Get the loading state
  const navigate = useNavigate();

  useEffect(() => {
    // Do nothing until we know for certain if the user is logged in or not.
    if (authLoading) {
      return; // Wait until loading is complete
    }

    // Case 1: The path is "/profile" (no userId). This is for the logged-in user.
    if (!userId) {
      if (loggedInUser) {
        // User is logged in. Do they have a garage?
        if (loggedInUser.garage) {
          navigate(
            `/garages/${loggedInUser.garage._id || loggedInUser.garage}`
          );
        } else {
          // No garage. Send them to create one.
          navigate('/onboarding');
        }
      } else {
        // Not logged in at all. Send to the home page.
        navigate('/');
      }
      return;
    }

    // Case 2: The path is "/profile/someOtherId". Looking at someone else's profile.
    api
      .get(`/users/${userId}`)
      .then(res => {
        const userOnPage = res.data.data.user;
        if (userOnPage && userOnPage.garage) {
          navigate(`/garages/${userOnPage.garage._id || userOnPage.garage}`);
        } else {
          // This user exists but has no garage.
          navigate('/no-garage');
        }
      })
      .catch(err => {
        console.error('Failed to fetch user profile for redirect', err);
        navigate('/not-found'); // The user ID probably doesn't exist
      });
  }, [userId, loggedInUser, authLoading, navigate]);

  // Render a loading state while the logic runs
  return (
    <div className="text-center p-10 font-semibold">Inspecting garage...</div>
  );
}
