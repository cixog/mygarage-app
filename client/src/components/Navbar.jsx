// client/src/components/Navbar.jsx (Updated with Login Modal)

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import LoginModal from './LoginModal'; // Import the new modal

const Navbar = () => {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // State for Login Modal
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleSearch = e => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userAvatar = user
    ? `${import.meta.env.VITE_STATIC_FILES_URL}/img/users/${user.avatar}`
    : 'default.jpg';

  return (
    <>
      {/* MODIFIED: Changed background to black, text to white/light gray */}
      <nav className="bg-black text-white py-3 shadow-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          {/* MODIFIED: Replaced text link with SVG logo */}
          <Link to="/">
            <img
              src="/cog-logo.svg"
              alt="MyGarage Logo"
              className="h-8 w-auto"
            />
          </Link>

          <div className="flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search for garages, vehicles, or users..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full border rounded-full px-4 py-1.5 text-sm text-black" // Text color for input
              />
            </form>
          </div>

          <div className="flex items-center space-x-6 text-lg font-medium">
            {/* MODIFIED: Updated link colors for dark background */}
            <Link
              to="/garages"
              className="text-gray-300 hover:text-white transition"
            >
              Garages
            </Link>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <img
                    src={userAvatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-500 hover:border-blue-400"
                  />
                </button>
                {isDropdownOpen && (
                  // Dropdown retains its white background for readability
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 text-black">
                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Garage
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </Link>
                    {user?.role === 'admin' && (
                      <>
                        <div className="border-t border-gray-200 my-1"></div>
                        <Link
                          to="/admin"
                          onClick={() => setIsDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-blue-600 font-bold hover:bg-gray-100"
                        >
                          Admin Dashboard
                        </Link>
                        <Link
                          to="/admin/tickets"
                          onClick={() => setIsDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-blue-600 font-bold hover:bg-gray-100"
                        >
                          Support Inbox
                        </Link>
                      </>
                    )}
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-gray-300 hover:text-white transition"
                >
                  Login
                </button>
                <Link
                  to="/signup"
                  className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm font-bold"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      {/* Render the modal component */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
