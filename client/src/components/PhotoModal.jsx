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

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-black p-4 rounded-lg shadow-xl max-w-4xl max-h-[95vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* --- THIS IS THE FIX --- */}
        {/* Replaced hardcoded URL with the environment variable */}
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
