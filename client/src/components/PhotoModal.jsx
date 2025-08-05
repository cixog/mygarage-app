// client/src/components/PhotoModal.jsx (Final version with correct event handling)

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassPlusIcon,
  ArrowsPointingOutIcon,
  ShareIcon,
} from '@heroicons/react/24/solid';

export default function PhotoModal({
  photos,
  currentIndex,
  vehicleId,
  onClose,
}) {
  const [internalIndex, setInternalIndex] = useState(currentIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const modalContentRef = useRef(null);

  const navigateToNext = useCallback(() => {
    if (internalIndex < photos.length - 1) {
      setInternalIndex(prevIndex => prevIndex + 1);
      setIsZoomed(false);
    }
  }, [internalIndex, photos.length]);

  const navigateToPrev = useCallback(() => {
    if (internalIndex > 0) {
      setInternalIndex(prevIndex => prevIndex - 1);
      setIsZoomed(false);
    }
  }, [internalIndex]);

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      modalContentRef.current?.requestFullscreen().catch(err => {
        alert(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
        );
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') navigateToNext();
      if (e.key === 'ArrowLeft') navigateToPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, navigateToNext, navigateToPrev]);

  if (currentIndex === null || !photos || photos.length === 0) {
    return null;
  }

  const currentPhoto = photos[internalIndex];
  const photoUrl = `${import.meta.env.VITE_STATIC_FILES_URL}/img/photos/${
    currentPhoto.photo
  }`;

  const pageUrl = `${window.location.origin}/vehicles/${vehicleId}`;
  const encodedUrl = encodeURIComponent(pageUrl);
  const shareText = encodeURIComponent(`Check out this vehicle from MyGarage!`);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${shareText}`,
    email: `mailto:?subject=${shareText}&body=I found this on MyGarage, check it out:%0A${encodedUrl}`,
  };

  return (
    // The main overlay. Clicking this background closes the modal.
    <div
      ref={modalContentRef}
      className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50"
      onClick={onClose}
    >
      {/* 
        This wrapper for the image prevents clicks on the image itself
        from closing the modal.
      */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        onClick={e => e.stopPropagation()}
      >
        <img
          src={photoUrl}
          alt={currentPhoto.caption || 'User upload'}
          className={`transition-transform duration-300 max-h-[90vh] max-w-[90vw] object-contain ${
            isZoomed ? 'scale-125' : 'scale-100'
          }`}
        />
      </div>

      {/* Top-Left: Photo Counter */}
      <div className="absolute top-4 left-4 text-white text-lg bg-black bg-opacity-50 px-3 py-1 rounded-lg font-mono">
        {internalIndex + 1} / {photos.length}
      </div>

      {/* Top-Right: Action Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        {/*
          --- THE FIX ---
          Each button's onClick now has an inline function that
          first calls e.stopPropagation() and then performs its action.
        */}
        <button
          onClick={e => {
            e.stopPropagation();
            setIsZoomed(!isZoomed);
          }}
          aria-label="Zoom In/Out"
          className="p-2 text-white bg-black bg-opacity-40 rounded-full hover:bg-opacity-60 transition"
        >
          <MagnifyingGlassPlusIcon className="w-6 h-6" />
        </button>

        <button
          onClick={e => {
            e.stopPropagation();
            handleFullscreenToggle();
          }}
          aria-label="Expand to full screen"
          className="p-2 text-white bg-black bg-opacity-40 rounded-full hover:bg-opacity-60 transition"
        >
          <ArrowsPointingOutIcon className="w-6 h-6" />
        </button>

        <div className="relative">
          <button
            onClick={e => {
              e.stopPropagation();
              setShowShareMenu(!showShareMenu);
            }}
            aria-label="Share photo"
            className="p-2 text-white bg-black bg-opacity-40 rounded-full hover:bg-opacity-60 transition"
          >
            <ShareIcon className="w-6 h-6" />
          </button>
          {showShareMenu && (
            // Clicks on the share menu itself are also stopped.
            <div
              onClick={e => e.stopPropagation()}
              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 text-black"
            >
              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Share on Facebook
              </a>
              <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Share on X
              </a>
              <a
                href={shareLinks.email}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Email to Friend
              </a>
            </div>
          )}
        </div>

        <button
          onClick={e => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close photo viewer"
          className="p-2 text-white bg-black bg-opacity-40 rounded-full hover:bg-opacity-60 transition"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* NAVIGATION ARROWS with the fix */}
      {internalIndex > 0 && (
        <button
          onClick={e => {
            e.stopPropagation();
            navigateToPrev();
          }}
          aria-label="Previous photo"
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white bg-black bg-opacity-30 rounded-full hover:bg-opacity-50 transition opacity-50 hover:opacity-100"
        >
          <ChevronLeftIcon className="w-8 h-8" />
        </button>
      )}

      {internalIndex < photos.length - 1 && (
        <button
          onClick={e => {
            e.stopPropagation();
            navigateToNext();
          }}
          aria-label="Next photo"
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white bg-black bg-opacity-30 rounded-full hover:bg-opacity-50 transition opacity-50 hover:opacity-100"
        >
          <ChevronRightIcon className="w-8 h-8" />
        </button>
      )}
    </div>
  );
}
