import Price from '@/models/Price';
import { PORTFOLIOS } from '@/lib/defaults';

// Body theke price row validate kore; error thakle string, nahole clean object
export function cleanPrice(b) {
  const r = { portfolio: b.portfolio, variety: (b.variety || '').trim(), seedClass: (b.seedClass || '').trim(), pack: (b.pack || '').trim(), price: +b.price };
  if (!PORTFOLIOS.includes(r.portfolio)) return 'Portfolio নির্বাচন করুন';
  if (!r.variety) return 'Variety দিন';
  if (!r.pack) return 'Grade / Pack দিন (যেমন 10 kg pack বা Grade A)';
  if (!(r.price > 0)) return 'Per kg price ০ এর বেশি হতে হবে';
  return r;
}
export const dupExists = (r, exceptId) => Price.exists({ portfolio: r.portfolio, variety: r.variety, seedClass: r.seedClass, pack: r.pack, ...(exceptId ? { _id: { $ne: exceptId } } : {}) });
