import TadaEntry from '@/models/TadaEntry';
import { route, json, fail } from '@/lib/api';

export const dynamic = 'force-dynamic';
const ok = (m) => /^\d{4}-\d{2}$/.test(m || '');

async function rechain(month) {
  const list = await TadaEntry.find({ month }).sort({ date: 1 });
  const ops = [];
  for (let i = 0; i < list.length; i++) {
    const e = list[i];
    const startOdo = i > 0 ? list[i - 1].endOdo : e.startOdo;
    ops.push({ updateOne: { filter: { _id: e._id }, update: { startOdo, endOdo: startOdo + e.usedKm } } });
    e.endOdo = startOdo + e.usedKm; e.startOdo = startOdo;
  }
  if (ops.length) await TadaEntry.bulkWrite(ops);
}
async function payload(month) {
  const entries = await TadaEntry.find({ month }).sort({ date: 1 }).lean();
  const prev = await TadaEntry.findOne({ month: { $lt: month } }).sort({ date: -1 }).lean();
  return { entries, carryOdo: prev ? prev.endOdo : null };
}

export const GET = route(async (req) => {
  const month = new URL(req.url).searchParams.get('month');
  if (!ok(month)) return fail('মাস ভুল');
  return json(await payload(month));
});
export const POST = route(async (req) => {
  const b = await req.json();
  if (!ok(b.month) || !b.date?.startsWith(b.month)) return fail('তারিখটি নির্বাচিত মাসের মধ্যে হতে হবে');
  if (!b.endPlace?.trim()) return fail('শেষের স্থান লিখুন');
  const usedKm = Number(b.usedKm);
  if (!Number.isFinite(usedKm) || usedKm < 0) return fail('ব্যবহৃত কিলোমিটার লিখুন');
  const exists = await TadaEntry.exists({ month: b.month, date: b.date });
  if (!exists && (await TadaEntry.countDocuments({ month: b.month })) >= 31) return fail('মূল ফরম্যাটে সর্বোচ্চ ৩১টি ভ্রমণ-স্লট আছে');
  const prior = await TadaEntry.findOne({ month: b.month, date: { $lt: b.date } }).sort({ date: -1 });
  const startOdo = prior ? prior.endOdo : Number(b.startOdo);
  if (!Number.isFinite(startOdo)) return fail('প্রথম এন্ট্রির প্রারম্ভিক মিটার লিখুন');
  await TadaEntry.findOneAndUpdate(
    { month: b.month, date: b.date },
    { startTime: b.startTime || '', endTime: b.endTime || '', endPlace: b.endPlace.trim(), startOdo, usedKm, endOdo: startOdo + usedKm,
      allowance: +b.allowance || 0, travelExpense: +b.travelExpense || 0, voucher: b.voucher || '', activity: b.activity || '' },
    { upsert: true, new: true, setDefaultsOnInsert: true });
  await rechain(b.month);
  return json(await payload(b.month));
});
export const DELETE = route(async (req) => {
  const sp = new URL(req.url).searchParams, month = sp.get('month');
  if (!ok(month)) return fail('মাস ভুল');
  await TadaEntry.deleteOne({ month, date: sp.get('date') });
  await rechain(month);
  return json(await payload(month));
});
