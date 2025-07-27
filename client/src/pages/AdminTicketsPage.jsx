// client/src/pages/AdminTicketsPage.jsx
import { useState, useEffect } from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Modal control functions
  const openModal = ticket => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTicket(null);
    setIsModalOpen(false);
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tickets');
      setTickets(res.data.data.tickets);
    } catch (err) {
      toast.error('Could not fetch tickets.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await api.patch(`/tickets/${ticketId}/status`, { status: newStatus });
      toast.success(`Ticket status updated to "${newStatus}"`);
      fetchTickets(); // Refresh the list to show the change
    } catch (err) {
      console.log(err);
      toast.error('Failed to update status.');
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'New':
        return 'bg-blue-200 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-200 text-yellow-800';
      case 'Closed':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  if (loading) return <p>Loading tickets...</p>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Support Ticket Inbox</h1>
      {tickets.length === 0 ? (
        <p>No tickets to show.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">From</th>
                <th className="text-left py-3 px-4">Category</th>
                <th className="text-left py-3 px-4">Subject</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr
                  key={ticket._id}
                  onClick={() => openModal(ticket)}
                  className="border-b hover:bg-gray-100 cursor-pointer transition"
                >
                  <td className="py-3 px-4 text-sm">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    {ticket.submittedBy?.name || 'N/A'}
                  </td>
                  <td className="py-3 px-4">{ticket.category}</td>
                  <td className="py-3 px-4">{ticket.subject}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                    {ticket.status !== 'Closed' && (
                      <button
                        onClick={() => handleStatusChange(ticket._id, 'Closed')}
                        className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Close
                      </button>
                    )}
                    {ticket.status === 'New' && (
                      <button
                        onClick={() =>
                          handleStatusChange(ticket._id, 'In Progress')
                        }
                        className="text-xs bg-yellow-500 text-black px-2 py-1 rounded ml-2 hover:bg-yellow-600"
                      >
                        In Progress
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- The Ticket Viewer Modal --- */}
      {isModalOpen && selectedTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black bg-opacity-60"
            onClick={closeModal}
          ></div>

          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-xl shadow-xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedTicket.subject}
              </h2>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>From:</strong>{' '}
                  {selectedTicket.submittedBy?.name || 'N/A'}
                </div>
                <div>
                  <strong>Email:</strong>{' '}
                  {selectedTicket.submittedBy?.email || 'N/A'}
                </div>
                <div>
                  <strong>Submitted:</strong>{' '}
                  {new Date(selectedTicket.createdAt).toLocaleString()}
                </div>
                <div>
                  <strong>Category:</strong> {selectedTicket.category}
                </div>
              </div>

              <div>
                <h3 className="font-bold border-b pb-1 mb-2">
                  Full Description
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                  {selectedTicket.description}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-4 p-4 bg-gray-50 border-t">
              <button
                onClick={closeModal}
                className="font-bold py-2 px-4 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
