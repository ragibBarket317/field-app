import TadaMonth from '@/models/TadaMonth';
import { EXPENSE_CATEGORIES } from '@/lib/defaults';
import { route, json, fail } from '@/lib/api';

export const dynamic = 'force-dynamic';
const ok = (m) => /^\d{4}-\d{2}$/.test(m || '');
const out = (d) => ({ expenses: d?.expenses || {}, monthComment: d?.monthComment || '' });

export const GET = route(async (req) => {
  const month = new URL(req.url).searchParams.get('month');
  if (!ok(month)) return fail('মাস ভুল');
  return json(out(await TadaMonth.findOne({ month }).lean()));
});
export const PUT = route(async (req) => {
  const b = await req.json();
  if (!ok(b.month)) return fail('মাস ভুল');
  const expenses = {};
  for (const c of EXPENSE_CATEGORIES) {
    const v = b.expenses?.[c.key] || {};
    expenses[c.key] = { label: c.custom ? (v.label || c.label) : c.label, amount: Math.max(0, +v.amount || 0), voucher: v.voucher || '', remark: v.remark || '' };
  }
  const d = await TadaMonth.findOneAndUpdate({ month: b.month }, { expenses, monthComment: (b.monthComment || '').trim() }, { upsert: true, new: true, setDefaultsOnInsert: true }).lean();
  return json(out(d));
});
