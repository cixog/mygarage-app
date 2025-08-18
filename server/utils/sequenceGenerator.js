// server/utils/sequenceGenerator.js
import Counter from '../models/counterModel.js';

/**
 * Atomically finds and increments a counter document in the database.
 * @param {string} sequenceName The name of the counter to increment (e.g., 'userOrder').
 * @returns {Promise<number>} The next number in the sequence.
 */
export const getNextSequence = async sequenceName => {
  const sequenceDoc = await Counter.findByIdAndUpdate(
    sequenceName,
    { $inc: { sequence_value: 1 } },
    // Options:
    // new: true     -> returns the document AFTER the update has been applied.
    // upsert: true  -> if no document is found, it creates a new one.
    { new: true, upsert: true }
  );
  return sequenceDoc.sequence_value;
};
