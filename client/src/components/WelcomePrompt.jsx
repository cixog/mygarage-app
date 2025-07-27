// client/src/components/WelcomePrompt.jsx

import { useState, useEffect } from 'react';

export default function WelcomePrompt({ targetRef, onClose }) {
  const [position, setPosition] = useState({ top: 0, left: 0, opacity: 0 });

  useEffect(() => {
    const calculatePosition = () => {
      if (targetRef.current) {
        const rect = targetRef.current.getBoundingClientRect();
        // Position the prompt to the left of the button, centered vertically.
        setPosition({
          top: rect.top + window.scrollY + rect.height / 2,
          left: rect.left + window.scrollX,
          opacity: 1, // Fade it in
        });
      }
    };

    // Calculate position on mount and on window resize
    calculatePosition();
    window.addEventListener('resize', calculatePosition);

    // Cleanup the event listener
    return () => window.removeEventListener('resize', calculatePosition);
  }, [targetRef]);

  return (
    // Full-screen overlay
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-60"
      onClick={onClose}
    >
      {/* The message box itself, positioned absolutely */}
      <div
        className="absolute w-64 p-4 bg-white rounded-lg shadow-2xl transition-opacity duration-300"
        style={{
          top: position.top,
          left: position.left,
          opacity: position.opacity,
          transform: 'translate(calc(-100% - 1.5rem), -50%)', // Move it left and center vertically
        }}
        onClick={e => e.stopPropagation()} // Prevent clicks inside from closing the prompt
      >
        <h3 className="text-lg font-bold text-gray-800">
          Welcome to your Garage!
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          This is your space to shine. Get started by adding your first vehicle
          to your collection.
        </p>
        <button
          onClick={onClose}
          className="mt-4 w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
        >
          Got it!
        </button>

        {/* The arrow pointing to the button */}
        <div className="absolute top-1/2 -right-2 w-4 h-4 bg-white transform -translate-y-1/2 rotate-45"></div>
      </div>
    </div>
  );
}
