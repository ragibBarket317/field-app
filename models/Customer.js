import mongoose from 'mongoose'
const S = new mongoose.Schema(
  {
    code: { type: String, default: '', trim: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, default: '', trim: true },
  },
  { timestamps: true },
)
S.index(
  { code: 1 },
  { unique: true, partialFilterExpression: { code: { $gt: '' } } },
)
export default mongoose.models.Customer || mongoose.model('Customer', S)
