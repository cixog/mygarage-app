// Save this file as: client/src/components/PhotoUpload.jsx

import { useState } from 'react';
import api from '../api/api';

export default function PhotoUpload({ onUploadSuccess, vehicleId }) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = e => {
    const selectedFiles = Array.from(e.target.files).slice(0, 5);
    setFiles(selectedFiles);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (files.length === 0) {
      setError('Please select at least one photo to upload.');
      return;
    }
    // 👇 check for vehicleId
    if (!vehicleId) {
      setError('A vehicle context is required to upload photos.');
      console.error('PhotoUpload component requires a vehicleId prop.');
      return;
    }

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    files.forEach(file => {
      formData.append('photos', file);
    });

    // 👇 CRITICAL: Add the vehicleId to the form data
    formData.append('vehicleId', vehicleId);

    try {
      await api.post('/photos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFiles([]);
      e.target.reset();
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Upload failed. Please try again.'
      );
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="my-6 p-4 border rounded-lg shadow-sm bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Upload New Photos</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="file"
            name="photos"
            multiple
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/gif"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            You can select up to 5 photos.
          </p>
        </div>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button
          type="submit"
          disabled={isUploading || files.length === 0}
          className="btn bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  );
}
