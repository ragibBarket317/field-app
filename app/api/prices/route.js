import Price from '@/models/Price';
import { PRICE_LIST } from '@/lib/defaults';
import { route, json, fail } from '@/lib/api';
import { cleanPrice, dupExists } from '@/lib/priceApi';

export const dynamic = 'force-dynamic';
export const GET = route(async () => {
  // Prothombar Seed_Invoice_Prices.xlsx er default price boshe jabe
  if ((await Price.estimatedDocumentCount()) === 0) await Price.insertMany(PRICE_LIST.map(([portfolio, variety, seedClass, pack, price]) => ({ portfolio, variety, seedClass, pack, price })));
  return json(await Price.find().sort({ portfolio: 1, variety: 1, seedClass: 1, pack: 1 }).lean());
});
export const POST = route(async (req) => {
  const r = cleanPrice(await req.json());
  if (typeof r === 'string') return fail(r);
  if (await dupExists(r)) return fail('এই Variety / Class / Pack এর দাম আগে থেকেই আছে');
  return json(await Price.create(r), 201);
});
