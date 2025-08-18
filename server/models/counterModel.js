// server/models/counterModel.js
import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  // We use a custom string _id so we can have multiple counters
  // in the same collection if needed later (e.g., 'userOrder', 'invoiceNumber')
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

export default Counter;
