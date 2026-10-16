import Customer from '@/models/Customer';
import { DEFAULT_CUSTOMERS } from '@/lib/defaults';
import { route, json, fail } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const GET = route(async () => {
  if ((await Customer.estimatedDocumentCount()) === 0) await Customer.insertMany(DEFAULT_CUSTOMERS);
  return json(await Customer.find().sort({ name: 1 }).lean());
});
export const POST = route(async (req) => {
  const b = await req.json();
  if (!b.name?.trim()) return fail('কাস্টমারের নাম দিন');
  const code = (b.code || '').trim();
  if (code && (await Customer.exists({ code }))) return fail('এই Customer Code আগে থেকেই আছে');
  return json(await Customer.create({ code, name: b.name, address: b.address || '' }), 201);
});
