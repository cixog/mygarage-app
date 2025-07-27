// server/models/ticketModel.js (Corrected with ES Modules)
import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: [
      'General Question',
      'Bug Report',
      'Feature Suggestion',
      'User Report',
      'Account Issue',
    ],
    required: [true, 'A category is required for the ticket.'],
  },
  subject: {
    type: String,
    required: [true, 'A subject is required.'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'A description is required.'],
  },
  status: {
    type: String,
    enum: ['New', 'In Progress', 'Closed'],
    default: 'New',
  },
  submittedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
