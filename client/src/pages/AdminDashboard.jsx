// client/src/pages/AdminDashboard.jsx (Final, Expanded, and Corrected Version)
import { useEffect, useState } from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  // --- SECTION 1: State Management ---
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [pendingEvents, setPendingEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // State for the review modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // --- SECTION 2: Data Fetching ---
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/users'); // Uses getAllUsers on the backend
      setUsers(res.data.data.data);
    } catch (err) {
      toast.error('Could not fetch users. Are you an admin?');
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchPendingEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await api.get('/events/admin/pending');
      setPendingEvents(res.data.data.data);
    } catch (err) {
      toast.error('Could not fetch pending events.');
      console.error(err);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPendingEvents();
  }, []);

  // --- SECTION 3: Action Handlers ---
  const handleDeactivateUser = async (userId, isActive) => {
    if (
      !window.confirm(
        `Are you sure you want to ${
          isActive ? 'deactivate' : 'reactivate'
        } this user?`
      )
    )
      return;
    try {
      // Your userController.updateUser will handle this
      await api.patch(`/users/${userId}`, { active: !isActive });
      toast.success(
        `User has been ${isActive ? 'deactivated' : 'reactivated'}.`
      );
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.log(err);
      toast.error('Failed to update user status.');
    }
  };

  const handleApproveEvent = async eventId => {
    if (!window.confirm('Are you sure you want to approve this event?')) return;
    try {
      await api.patch(`/events/admin/${eventId}/approve`);
      toast.success('Event approved and is now live.');
      closeModal(); // Close the modal on success
      fetchPendingEvents(); // Refresh the list
    } catch (err) {
      toast.error('Failed to approve event.');
      console.error(err);
    }
  };

  const handleRejectEvent = async eventId => {
    const reason = window.prompt(
      'Please provide a reason for rejecting this event (optional).'
    );
    if (reason === null) return; // User clicked "Cancel"

    try {
      await api.patch(`/events/admin/${eventId}/reject`, { reason });
      toast.success('Event has been rejected.');
      closeModal(); // Close the modal on success
      fetchPendingEvents(); // Refresh the list
    } catch (err) {
      toast.error('Failed to reject event.');
      console.error(err);
    }
  };

  // Functions to control the modal
  const openModal = event => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // --- SECTION 4: JSX Rendering ---
  return (
    <>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* --- User Management Section --- */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6">User Management</h1>
          {loadingUsers ? (
            <p>Loading users...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} className="border-b">
                      <td className="py-3 px-4">{user.name}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            user.active
                              ? 'bg-green-200 text-green-800'
                              : 'bg-red-200 text-red-800'
                          }`}
                        >
                          {user.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() =>
                            handleDeactivateUser(user._id, user.active)
                          }
                          className={`font-bold py-1 px-3 rounded ${
                            user.active
                              ? 'bg-yellow-500 text-white'
                              : 'bg-green-500 text-white'
                          }`}
                        >
                          {user.active ? 'Deactivate' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* --- Pending Events Section --- */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-3xl font-bold mb-6">Pending Event Submissions</h2>
          {loadingEvents ? (
            <p>Loading events to review...</p>
          ) : pendingEvents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left py-3 px-4">Event Title</th>
                    <th className="text-left py-3 px-4">Location</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">Date(s)</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingEvents.map(event => (
                    <tr key={event._id} className="border-b">
                      <td className="py-3 px-4 font-medium">
                        <button
                          onClick={() => openModal(event)}
                          className="text-blue-600 hover:underline text-left"
                        >
                          {event.title}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        {event.location?.address || ''}
                      </td>
                      <td className="py-3 px-4">{event.category}</td>
                      <td className="py-3 px-4">
                        {new Date(event.startDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">There are no events pending review.</p>
          )}
        </div>
      </div>

      {/* --- The Event Review Modal --- */}
      {isModalOpen && selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black bg-opacity-60"
            onClick={closeModal}
          ></div>
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedEvent.title}
              </h2>
              {selectedEvent.image && (
                <div className="w-full aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    // ✅ THIS IS THE FIX: Use the 'image' property directly as it's a full URL.
                    src={selectedEvent.image}
                    alt={`Submission for ${selectedEvent.title}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <p>
                  <strong>Location:</strong>{' '}
                  {selectedEvent.location?.address || ''}
                </p>
                <p>
                  <strong>Category:</strong> {selectedEvent.category}
                </p>
                <p>
                  <strong>Start Date:</strong>{' '}
                  {new Date(selectedEvent.startDate).toLocaleString()}
                </p>
                <p>
                  <strong>End Date:</strong>{' '}
                  {new Date(selectedEvent.endDate).toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="font-bold border-b pb-1 mb-2">
                  Short Description
                </h3>
                <p className="text-gray-700">
                  {selectedEvent.shortDescription}
                </p>
              </div>
              <div>
                <h3 className="font-bold border-b pb-1 mb-2">
                  Full Description
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedEvent.fullDescription}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-4 p-4 bg-gray-50 border-t">
              <button
                onClick={closeModal}
                className="font-bold py-2 px-4 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectEvent(selectedEvent._id)}
                className="font-bold py-2 px-4 rounded bg-red-500 text-white hover:bg-red-600"
              >
                Reject
              </button>
              <button
                onClick={() => handleApproveEvent(selectedEvent._id)}
                className="font-bold py-2 px-4 rounded bg-green-500 text-white hover:bg-green-600"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
