import mongoose from 'mongoose';
const S = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  date: { type: String, required: true },
  type: { type: String, enum: ['Sales', 'MRR', 'Bank Payment'], required: true },
  portfolio: { type: String, required: true },
  invoice: { type: String, default: '' },
  variety: { type: String, default: '' },
  grade: { type: String, default: '' },
  kg: { type: Number, default: 0 },
  rate: { type: Number, default: 0 },
  amount: { type: Number, required: true },
  bank: { type: String, default: '' },
  branch: { type: String, default: '' },
  notes: { type: String, default: '' },
}, { timestamps: true });
export default mongoose.models.Transaction || mongoose.model('Transaction', S);
