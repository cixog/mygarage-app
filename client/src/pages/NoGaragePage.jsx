// client/src/pages/NoGaragePage.jsx
import { Link } from 'react-router-dom';

export default function NoGaragePage() {
  return (
    <div className="text-center py-20 bg-gray-50 rounded-lg">
      <h2 className="text-3xl font-bold text-gray-700">No Garage Found</h2>
      <p className="text-lg text-gray-500 mt-3">
        This user has not set up their public garage yet.
      </p>
      <Link
        to="/garages"
        className="mt-6 inline-block bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition"
      >
        Explore Other Garages
      </Link>
    </div>
  );
}
