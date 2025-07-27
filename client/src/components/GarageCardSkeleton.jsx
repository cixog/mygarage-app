// client/src/components/GarageCardSkeleton.jsx

export default function GarageCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Image Placeholder */}
      <div className="h-48 bg-gray-300"></div>

      {/* Content Placeholder */}
      <div className="p-4">
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-full mb-1"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        <div className="flex justify-between items-center mt-4">
          <div className="h-5 bg-gray-300 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
}
