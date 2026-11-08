import Transaction from '@/models/Transaction';
import Customer from '@/models/Customer';
import { PORTFOLIOS } from '@/lib/defaults';
import { route, json, fail } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const GET = route(async () => json(await Transaction.find().sort({ date: -1, createdAt: -1 }).lean()));

// Ek ta invoice / bank deposit e ekadik portfolio line: body.items = [{ portfolio, variety, grade, kg, rate, amount }]
// Purono format (single line, body.portfolio etc.) o cholbe.
export const POST = route(async (req) => {
  const b = await req.json();
  if (!(await Customer.exists({ _id: b.customer }))) return fail('সঠিক কাস্টমার নির্বাচন করুন');
  if (!b.date) return fail('তারিখ দিন');
  if (!['Sales', 'MRR', 'Bank Payment'].includes(b.type)) return fail('লেনদেনের ধরন ভুল');
  const items = Array.isArray(b.items) && b.items.length ? b.items : [b];
  const bank = b.type === 'Bank Payment';
  const batchId = 'B' + Date.now() + Math.random().toString(36).slice(2, 6);
  const docs = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i], tag = items.length > 1 ? `(আইটেম ${i + 1}) ` : '';
    if (!PORTFOLIOS.includes(it.portfolio)) return fail(tag + 'Portfolio নির্বাচন করুন');
    const t = { customer: b.customer, date: b.date, type: b.type, portfolio: it.portfolio, notes: b.notes || '', batchId };
    if (bank) {
      Object.assign(t, { bank: (b.bank || '').trim(), branch: (b.branch || '').trim(), amount: +it.amount });
      if (!t.bank || !t.branch) return fail('Bank Name ও Branch দিন');
    } else {
      const kg = +it.kg || 0, rate = +it.rate || 0;
      Object.assign(t, { invoice: (b.invoice || '').trim(), variety: (it.variety || '').trim(), grade: it.grade || '', seedClass: it.seedClass || '', pack: it.pack || '', kg, rate, amount: +it.amount || kg * rate });
      if (!t.invoice) return fail('Invoice নম্বর দিন')
      if (!t.variety) return fail(tag + 'Variety / Product দিন');
      if (it.portfolio === 'Inbred Rice' && b.type === 'Sales' && !t.grade) return fail(tag + 'Inbred Rice-এর Grade (FS/CS/TLS) দিন');
    }
    if (!(t.amount > 0)) return fail(tag + 'Amount ০ এর বেশি হতে হবে');
    docs.push(t);
  }
  const created = await Transaction.insertMany(docs);
  return json(created.length === 1 ? created[0] : created, 201);
});
