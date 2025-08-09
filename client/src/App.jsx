// client/src/App.jsx (Final and Correct)
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// 1. Import from the library and your functional fallback component
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './components/ErrorFallback';

// Your Component/Page Imports
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import AllGarages from './pages/AllGarages';
import GarageProfilePage from './pages/GarageProfilePage';
import VehiclePage from './pages/VehiclePage';
import UserProfileRedirect from './pages/UserProfile';
import NotFoundPage from './pages/NotFoundPage';
import NoGaragePage from './pages/NoGaragePage';
import SearchResultsPage from './pages/SearchResultsPage';
import AdminDashboard from './pages/AdminDashboard';
import AboutUs from './pages/AboutUs';
import ToolBox from './pages/ToolBox';
import SiteMap from './pages/SiteMap';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import EventsListPage from './pages/EventsListPage';
import SubmitEventPage from './pages/SubmitEventPage';
import EventDetailPage from './pages/EventDetailPage';
import AdminTicketsPage from './pages/AdminTicketsPage';
import SettingsPage from './pages/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import VerifyEmailPage from './pages/VerifyEmailPage';

const MapSearchPage = lazy(() => import('./pages/MapSearchPage'));

function App() {
  return (
    <Router>
      <div className="flex-container">
        <Toaster position="top-center" />
        <Navbar />
        <main>
          {/* 2. This is the correct, global placement of the ErrorBoundary */}
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense
              fallback={
                <div className="text-center p-10 font-semibold">
                  Loading Page...
                </div>
              }
            >
              <Routes>
                {/* All of your existing routes go here, unchanged */}
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                  path="/verify-email/:token"
                  element={<VerifyEmailPage />}
                />
                <Route
                  path="/forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route
                  path="/reset-password/:token"
                  element={<ResetPasswordPage />}
                />
                <Route path="/garages" element={<AllGarages />} />
                <Route
                  path="/garages/:garageId"
                  element={<GarageProfilePage />}
                />
                <Route path="/vehicles/:vehicleId" element={<VehiclePage />} />
                <Route
                  path="/profile/:userId"
                  element={<UserProfileRedirect />}
                />
                <Route path="/no-garage" element={<NoGaragePage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/toolbox" element={<ToolBox />} />
                <Route path="/sitemap" element={<SiteMap />} />
                <Route path="/events" element={<EventsListPage />} />
                <Route path="/events/:eventId" element={<EventDetailPage />} />
                <Route path="/map-search" element={<MapSearchPage />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/profile" element={<UserProfileRedirect />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/tickets" element={<AdminTicketsPage />} />
                  <Route path="/events/submit" element={<SubmitEventPage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
