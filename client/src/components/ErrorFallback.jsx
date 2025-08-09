// client/src/components/ErrorFallback.jsx
import { Link } from 'react-router-dom';

function ErrorFallback({ error, resetErrorBoundary }) {
  // The 'resetErrorBoundary' function is passed by the library
  // to allow the user to try and re-render the content.
  return (
    <div
      className="text-center p-10 bg-red-50 border border-red-200 rounded-lg"
      role="alert"
    >
      <h1 className="text-3xl font-bold text-red-700">
        Oops! Something went wrong.
      </h1>
      <p className="text-lg text-gray-600 mt-4">
        An unexpected error occurred. Our pit crew has been notified.
      </p>
      <pre className="mt-2 p-2 bg-red-100 text-red-800 rounded text-left text-sm">
        {error.message}
      </pre>
      <div className="mt-6">
        <button
          onClick={resetErrorBoundary}
          className="mr-4 inline-block bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition"
        >
          Try Again
        </button>
        <Link
          to="/"
          className="inline-block bg-gray-700 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-800 transition"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}

export default ErrorFallback;
