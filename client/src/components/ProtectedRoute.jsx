// client/src/components/ProtectedRoute.jsx
// component currently redirects unauthorized users to the /login page
// changing to redirect to the homepage (/)
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner
  }

  // ✅ CHANGE: Instead of navigating to "/login", navigate to the homepage.
  return user ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
