// client/src/pages/SiteMap.jsx
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';

export default function SiteMap() {
  return (
    <>
      <Helmet>
        <title>Site Map | TourMyGarage</title>
        <meta
          name="description"
          content="Explore the TourMyGarage site map — quick links to garages, events, login, and more. Find your way around the community for gearheads and collectors."
        />
        <link rel="canonical" href={window.location.href} />

        {/* Optional: Social sharing metadata */}
        <meta property="og:title" content="Site Map | TourMyGarage" />
        <meta
          property="og:description"
          content="Navigate TourMyGarage with ease. Use our site map to quickly find garages, events, and member tools."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
      </Helmet>
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
    </>
  );
}
