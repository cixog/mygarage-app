// client/src/components/PhotoCardSkeleton.jsx

export default function PhotoCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 animate-pulse">
      {/* Card Header */}
      <div className="p-3 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gray-300"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>

      {/* Photo Placeholder */}
      {/* We use aspect-w-1 and aspect-h-1 for a square image placeholder */}
      <div className="w-full aspect-w-1 aspect-h-1 bg-gray-300"></div>

      {/* Card Body */}
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
      </div>
    </div>
  );
}
//(Note: For the aspect-w-1 aspect-h-1 classes to work, you may need to install
// the official Tailwind CSS aspect-ratio plugin:
// >>>>>     npm install -D @tailwindcss/aspect-ratio     <<<<<<<<<
// and add require('@tailwindcss/aspect-ratio') to the plugins array in your
// tailwind.config.js file. If you prefer not to do this, you can simply give the
// photo placeholder a fixed height like h-64).
