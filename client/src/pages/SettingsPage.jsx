import { useState } from 'react';
import UpdateProfileForm from '../components/UpdateProfileForm';
import UpdatePasswordForm from '../components/UpdatePasswordForm';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();
  // State for the safety toggle. Default is false (safety is ON).
  const [isSafetyOff, setIsSafetyOff] = useState(false);

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you absolutely sure? This cannot be undone.')) {
      try {
        await api.delete('/users/deleteMe');
        toast.success('Your account has been deleted.');
        logout();
      } catch (err) {
        console.log(err);
        toast.error('Failed to delete account.');
      }
    }
  };

  const handleDeleteGarage = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete your garage? This action cannot be undone.'
      )
    ) {
      try {
        await api.delete('/garages/my-garage');
        toast.success('Your garage has been deleted.');
        await refreshUser();
      } catch (err) {
        console.log(err);
        toast.error('Failed to delete garage.');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-12">
      <h1 className="text-4xl font-bold text-gray-800 border-b pb-4">
        Account Settings
      </h1>

      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
        <UpdateProfileForm />
      </div>

      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Update Password</h2>
        <UpdatePasswordForm />
      </div>

      <div className="p-6 bg-white rounded-lg shadow-md border-2 border-red-500">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-red-600">Danger Zone</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSafetyOff(!isSafetyOff)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isSafetyOff ? 'bg-red-600' : 'bg-green-500'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isSafetyOff ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            {isSafetyOff && (
              <span className="text-red-500 font-bold text-sm animate-pulse">
                SAFETY OFF
              </span>
            )}
          </div>
        </div>

        {user && user.garage && (
          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              This will permanently remove your garage and all associated data.
            </p>
            <button
              onClick={handleDeleteGarage}
              disabled={!isSafetyOff}
              className="btn bg-orange-600 text-white p-2 rounded font-bold transition-opacity disabled:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete My Garage
            </button>
          </div>
        )}

        <p className="text-gray-600 mb-4">
          Deleting your account is a permanent action.
        </p>
        <button
          onClick={handleDeleteAccount}
          disabled={!isSafetyOff}
          className="btn bg-red-600 text-white p-2 rounded font-bold transition-opacity disabled:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Delete My Account
        </button>
      </div>
    </div>
  );
}
