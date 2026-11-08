import mongoose from 'mongoose'
const S = new mongoose.Schema(
  {
    month: { type: String, required: true, index: true }, // YYYY-MM
    date: { type: String, required: true }, // YYYY-MM-DD
    startTime: { type: String, default: '' },
    endTime: { type: String, default: '' },
    endPlace: { type: String, required: true },
    startOdo: { type: Number, default: 0 },
    usedKm: { type: Number, default: 0 },
    endOdo: { type: Number, default: 0 },
    allowance: { type: Number, default: 0 },
    travelExpense: { type: Number, default: 0 },
    voucher: { type: String, default: '' },
    activity: { type: String, default: '' },
  },
  { timestamps: true },
)
S.index({ month: 1, date: 1 }, { unique: true })
export default mongoose.models.TadaEntry || mongoose.model('TadaEntry', S)
