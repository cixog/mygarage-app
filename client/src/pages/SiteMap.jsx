// client/src/pages/SiteMap.jsx
import { Link } from 'react-router-dom';

export default function SiteMap() {
  return (
    <div className="py-12">
      <h1 className="text-4xl font-bold text-center">Site Map</h1>
      <ul className="mt-8 max-w-sm mx-auto space-y-2 text-center text-blue-600">
        <li>
          <Link to="/" className="hover:underline">
            Home
          </Link>
        </li>
        <li>
          <Link to="/garages" className="hover:underline">
            All Garages
          </Link>
        </li>
        <li>
          <Link to="/login" className="hover:underline">
            Login
          </Link>
        </li>
        <li>
          <Link to="/signup" className="hover:underline">
            Sign Up
          </Link>
        </li>
      </ul>
    </div>
  );
}
