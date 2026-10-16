import Customer from '@/models/Customer';
import Transaction from '@/models/Transaction';
import { route, json, fail } from '@/lib/api';

export const PUT = route(async (req, { params }) => {
  const b = await req.json();
  const code = (b.code || '').trim();
  if (!b.name?.trim()) return fail('কাস্টমারের নাম দিন');
  if (code && (await Customer.exists({ code, _id: { $ne: params.id } }))) return fail('এই Customer Code অন্য কাস্টমারে আছে');
  const c = await Customer.findByIdAndUpdate(params.id, { code, name: b.name, address: b.address || '' }, { new: true });
  return c ? json(c) : fail('কাস্টমার পাওয়া যায়নি', 404);
});
export const DELETE = route(async (_req, { params }) => {
  if (await Transaction.exists({ customer: params.id })) return fail('এই কাস্টমারের লেনদেন আছে, তাই মুছা যাবে না');
  await Customer.findByIdAndDelete(params.id);
  return json({ ok: true });
});
