// client/src/pages/ToolBox.jsx
import { useState } from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';

export default function ToolBox() {
  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.category || !formData.subject || !formData.description) {
      toast.error('Please fill out all fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/tickets/submit', formData);
      toast.success(res.data.message);
      // Reset form after successful submission
      setFormData({ category: '', subject: '', description: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-12 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center mb-2">Tool Box</h1>
      <p className="text-lg text-gray-600 mt-2 text-left mb-1">
        Have a question or need to report an issue? Let us know!
      </p>
      <p className="text-lg text-gray-600 mt-1 text-left mb-8">
        (Just remember, we're a small pit crew.)
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="category" className="block font-medium text-gray-700">
            Will you ballpark this?
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 mt-1 bg-white"
          >
            <option value="" disabled>
              -- Please select a category --
            </option>
            <option value="General Question">General Question</option>
            <option value="Bug Report">Bug Report</option>
            <option value="Feature Suggestion">Feature Suggestion</option>
            <option value="User Report">Report a User or Garage</option>
            <option value="Account Issue">Account Issue</option>
          </select>
        </div>
        <div>
          <label htmlFor="subject" className="block font-medium text-gray-700">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 mt-1"
            placeholder="A brief summary of your request"
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block font-medium text-gray-700"
          >
            Details
          </label>
          <textarea
            id="description"
            name="description"
            rows="6"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 mt-1"
            placeholder="What's going on?"
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}
