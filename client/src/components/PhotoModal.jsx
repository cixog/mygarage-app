// client/src/components/PhotoModal.jsx (Corrected)

import { useEffect } from 'react';

export default function PhotoModal({ photo, onClose }) {
  useEffect(() => {
    const handleEsc = event => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!photo) return null; // Guard clause

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
      onClick={onClose} // This allows clicking the background to close
    >
      {/* --- START: The Close Button --- */}
      <button
        onClick={onClose}
        aria-label="Close photo viewer" // Important for accessibility
        className="absolute top-4 right-4 text-gray-400 text-4xl font-bold z-50 hover:text-gray-300 transition"
      >
        × {/* This is the HTML entity for the 'X' symbol */}
      </button>
      {/* --- END: The Close Button --- */}

      <div
        className="bg-black p-4 rounded-lg shadow-xl max-w-4xl max-h-[95vh]"
        onClick={e => e.stopPropagation()} // Prevents clicks on the image from closing the modal
      >
        <img
          src={`${import.meta.env.VITE_STATIC_FILES_URL}/img/photos/${
            photo.photo
          }`}
          alt={photo.caption || 'User upload'}
          className="max-h-[calc(95vh-2rem)] w-auto h-auto object-contain"
        />
      </div>
    </div>
  );
}
