import mongoose from 'mongoose'
const S = new mongoose.Schema(
  {
    month: { type: String, required: true, unique: true }, // YYYY-MM
    expenses: { type: mongoose.Schema.Types.Mixed, default: {} }, // { key: {label, amount, voucher, remark} }
    monthComment: { type: String, default: '' },
  },
  { timestamps: true },
)
export default mongoose.models.TadaMonth || mongoose.model('TadaMonth', S)
