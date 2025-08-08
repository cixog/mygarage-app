// client/src/components/FollowPlaceholderCard.jsx
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/solid';

export default function FollowPlaceholderCard() {
  return (
    // This div will span the entire width of the grid it's placed in.
    <div className="col-span-1 sm:col-span-2 lg:col-span-4">
      <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center">
        <div className="bg-gray-200 p-3 rounded-full mb-4">
          <PlusIcon className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700">
          Your Feed is Empty
        </h3>
        <p className="mt-1 text-gray-500">
          You’re not following anyone yet — which is great if you’re in a race…
          less great if you want to see cool stuff here.
        </p>
        <Link
          to="/garages"
          className="mt-4 bg-blue-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-700 transition"
        >
          Explore Garages
        </Link>
      </div>
    </div>
  );
}
