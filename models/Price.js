import mongoose from 'mongoose'
// Seed Invoice Price list — ek row = Portfolio + Variety + Seed Class + Grade/Pack => Tk per kg
const S = new mongoose.Schema(
  {
    portfolio: { type: String, required: true, index: true },
    variety: { type: String, required: true, trim: true },
    seedClass: { type: String, default: '', trim: true },
    pack: { type: String, required: true, trim: true }, // "10 kg pack" ba "Grade A"
    price: { type: Number, required: true }, // Tk / kg
  },
  { timestamps: true },
)
S.index({ portfolio: 1, variety: 1, seedClass: 1, pack: 1 }, { unique: true })
export default mongoose.models.Price || mongoose.model('Price', S)
