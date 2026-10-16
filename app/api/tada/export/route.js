import TadaEntry from '@/models/TadaEntry';
import { buildTadaWorkbook } from '@/lib/tadaExcel';
import { route, fail } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const GET = route(async (req) => {
  const month = new URL(req.url).searchParams.get('month');
  if (!/^\d{4}-\d{2}$/.test(month || '')) return fail('মাস ভুল');
  const entries = await TadaEntry.find({ month }).sort({ date: 1 }).lean();
  if (!entries.length) return fail('এই মাসে কোনো ভ্রমণ তথ্য নেই');
  const buf = await buildTadaWorkbook(month, entries);
  return new Response(buf, { headers: {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': `attachment; filename="Copy-of-Tada-${month}.xlsx"`,
  } });
});
