import Transaction from '@/models/Transaction';
import Customer from '@/models/Customer';
import { PORTFOLIOS } from '@/lib/defaults';
import { route, json, fail } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const GET = route(async () => json(await Transaction.find().sort({ date: -1, createdAt: -1 }).lean()));
export const POST = route(async (req) => {
  const b = await req.json();
  if (!(await Customer.exists({ _id: b.customer }))) return fail('সঠিক কাস্টমার নির্বাচন করুন');
  if (!b.date) return fail('তারিখ দিন');
  if (!['Sales', 'MRR', 'Bank Payment'].includes(b.type)) return fail('লেনদেনের ধরন ভুল');
  if (!PORTFOLIOS.includes(b.portfolio)) return fail('Portfolio নির্বাচন করুন');
  const t = { customer: b.customer, date: b.date, type: b.type, portfolio: b.portfolio, notes: b.notes || '' };
  if (b.type === 'Bank Payment') {
    Object.assign(t, { bank: (b.bank || '').trim(), branch: (b.branch || '').trim(), amount: +b.amount });
    if (!t.bank || !t.branch) return fail('Bank Name ও Branch দিন');
  } else {
    const kg = +b.kg || 0, rate = +b.rate || 0;
    Object.assign(t, { invoice: (b.invoice || '').trim(), variety: (b.variety || '').trim(), grade: b.grade || '', kg, rate, amount: +b.amount || kg * rate });
    if (!t.variety) return fail('Variety / Product দিন');
    if (b.portfolio === 'Inbred Rice' && b.type === 'Sales' && !t.grade) return fail('Inbred Rice-এর Grade (FS/CS/TLS) দিন');
  }
  if (!(t.amount > 0)) return fail('Amount ০ এর বেশি হতে হবে');
  return json(await Transaction.create(t), 201);
});
