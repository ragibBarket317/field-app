import Transaction from '@/models/Transaction';
import { route, json } from '@/lib/api';
export const DELETE = route(async (_r, { params }) => { await Transaction.findByIdAndDelete(params.id); return json({ ok: true }); });
