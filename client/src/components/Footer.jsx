// client/src/components/Footer.jsx
import { Link } from 'react-router-dom';

export default function Footer() {
  // A helper component for social links to avoid repetition
  const SocialLink = ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-400 hover:text-white transition"
    >
      {children}
    </a>
  );

  return (
    // MODIFIED: Changed background to black and default text to a light gray
    <footer className="bg-black text-gray-300 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Column 1: Logo */}
          <div className="col-span-1 md:col-span-2">
            <Link
              to="/"
              className="text-3xl font-bold text-white hover:text-blue-400"
            >
              MyGarage
            </Link>
            {/* MODIFIED: Updated text color for visibility */}
            <p className="mt-2 text-sm text-gray-400">
              A community for showcasing car collections.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h3 className="font-bold tracking-wider uppercase text-white">
              Navigate
            </h3>
            {/* MODIFIED: Link colors updated for dark theme */}
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/about-us" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/toolbox" className="hover:text-white transition">
                  Tool Box
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-white transition">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/sitemap" className="hover:text-white transition">
                  Site Map
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Find Us */}
          <div>
            <h3 className="font-bold tracking-wider uppercase text-white">
              Find Us
            </h3>
            <div className="mt-4 flex space-x-4">
              <SocialLink href="https://facebook.com">Facebook</SocialLink>
              <SocialLink href="https://instagram.com">Instagram</SocialLink>
              <SocialLink href="https://x.com">X</SocialLink>
            </div>
          </div>
        </div>

        {/* MODIFIED: Updated border and text colors */}
        <div className="mt-8 border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
          <p>©{new Date().getFullYear()} TourMyGarage. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
