// client/src/pages/NotFoundPage.jsx
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-2xl font-light text-gray-600 mt-4">Page Not Found</p>
      <p className="text-gray-500 mt-2">
        Sorry, the page you are looking for does not exist.
      </p>
      <p className="text-gray-500 mt-2 leading-relaxed">
        Should you need to contact us:{' '}
        <a
          href="mailto:support@tourmygarage.com?subject=Support%20Request&body=Hi%20there,%0D%0A%0D%0AI%20need%20help%20with..."
          className="font-semibold text-blue-600 hover:underline"
        >
          Support
        </a>
      </p>
      <Link
        to="/"
        className="mt-6 inline-block bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition"
      >
        Go to Homepage
      </Link>
    </div>
  );
}
