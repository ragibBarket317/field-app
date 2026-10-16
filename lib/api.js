import { NextResponse } from 'next/server';
import { connectDB } from './db';
export const json = (data, status = 200) => NextResponse.json(data, { status });
export const fail = (msg, status = 400) => NextResponse.json({ error: msg }, { status });
export function route(fn) {
  return async (req, ctx) => {
    try { await connectDB(); return await fn(req, ctx); }
    catch (e) { console.error(e); return fail(e.message || 'সার্ভার ত্রুটি', 500); }
  };
}
