import Price from '@/models/Price';
import { route, json, fail } from '@/lib/api';
import { cleanPrice, dupExists } from '@/lib/priceApi';

export const PUT = route(async (req, { params }) => {
  const r = cleanPrice(await req.json());
  if (typeof r === 'string') return fail(r);
  if (await dupExists(r, params.id)) return fail('এই Variety / Class / Pack এর দাম আগে থেকেই আছে');
  const p = await Price.findByIdAndUpdate(params.id, r, { new: true });
  return p ? json(p) : fail('দাম পাওয়া যায়নি', 404);
});
export const DELETE = route(async (_req, { params }) => {
  await Price.findByIdAndDelete(params.id);
  return json({ ok: true });
});
