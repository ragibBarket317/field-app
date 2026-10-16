'use client';
import { useMemo, useState } from 'react';
import { api } from '@/lib/client';
import { PORTFOLIOS } from '@/lib/defaults';
import { money } from '@/lib/bn';
import { Field, Seg, Empty } from './ui';

const today = () => new Date().toLocaleDateString('en-CA');
const blank = { code: '', customer: '', date: today(), portfolio: PORTFOLIOS[0], invoice: '', variety: '', grade: '', kg: '', rate: '', amount: '', bank: '', branch: '' };

export default function Entry({ customers, txs, reload, toast }) {
  const [type, setType] = useState('Sales');
  const [f, setF] = useState(blank);
  const [manual, setManual] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const cmap = useMemo(() => Object.fromEntries(customers.map((c) => [c._id, c])), [customers]);
  const varieties = useMemo(() => [...new Set(txs.map((t) => t.variety).filter(Boolean))], [txs]);
  const bank = type === 'Bank Payment', line = (+f.kg || 0) * (+f.rate || 0);

  const onCode = (v) => { const c = customers.find((x) => x.code && x.code === v.trim()); setF((p) => ({ ...p, code: v, customer: c ? c._id : p.customer })); };
  const onCustomer = (id) => setF((p) => ({ ...p, customer: id, code: cmap[id]?.code || '' }));
  const calc = (k, v) => setF((p) => { const n = { ...p, [k]: v }; if (!manual) { const a = (+n.kg || 0) * (+n.rate || 0); n.amount = a ? String(a) : ''; } return n; });

  async function submit(e) {
    e.preventDefault(); setBusy(true);
    try {
      await api('/api/transactions', { method: 'POST', body: { ...f, type, amount: +f.amount || line } });
      toast('লেনদেন সংরক্ষণ হয়েছে');
      setF((p) => ({ ...blank, customer: p.customer, code: p.code, date: p.date, portfolio: p.portfolio })); setManual(false);
      await reload();
    } catch (err) { toast(err.message, true); } finally { setBusy(false); }
  }
  const recent = txs.slice(0, 6);
  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="card space-y-4">
        <div><h2 className="font-extrabold text-lg">লেনদেন যোগ করুন</h2><p className="text-xs text-slate-500 mt-0.5">কাস্টমার কোড লিখুন বা তালিকা থেকে বেছে নিন।</p></div>
        <Seg value={type} onChange={setType} options={[['Sales', 'Sales'], ['MRR', 'MRR · ফেরত'], ['Bank Payment', 'Bank Payment']]} />
        <div className="grid grid-cols-[110px_1fr] gap-3">
          <Field label="Code"><input className="inp" inputMode="numeric" placeholder="1702" value={f.code} onChange={(e) => onCode(e.target.value)} /></Field>
          <Field label="কাস্টমার *"><select className="inp" required value={f.customer} onChange={(e) => onCustomer(e.target.value)}><option value="">নির্বাচন করুন</option>{customers.map((c) => <option key={c._id} value={c._id}>{c.code ? c.code + ' · ' : ''}{c.name}</option>)}</select></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="তারিখ *"><input className="inp" type="date" required value={f.date} onChange={(e) => set('date', e.target.value)} /></Field>
          <Field label="Portfolio *"><select className="inp" value={f.portfolio} onChange={(e) => set('portfolio', e.target.value)}>{PORTFOLIOS.map((p) => <option key={p}>{p}</option>)}</select></Field>
        </div>
        {bank ? (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bank Name *"><input className="inp" required value={f.bank} onChange={(e) => set('bank', e.target.value)} placeholder="ব্যাংকের নাম" /></Field>
            <Field label="Branch *"><input className="inp" required value={f.branch} onChange={(e) => set('branch', e.target.value)} placeholder="শাখা" /></Field>
            <Field label="Amount (BDT) *" className="col-span-2"><input className="inp" type="number" inputMode="decimal" min="0" step="0.01" required value={f.amount} onChange={(e) => set('amount', e.target.value)} placeholder="0" /></Field>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Invoice No."><input className="inp" value={f.invoice} onChange={(e) => set('invoice', e.target.value)} placeholder="ইনভয়েস নম্বর" /></Field>
            {f.portfolio === 'Inbred Rice' && type === 'Sales'
              ? <Field label="Upshi Grade *"><select className="inp" required value={f.grade} onChange={(e) => set('grade', e.target.value)}><option value="">নির্বাচন</option><option>FS</option><option>CS</option><option>TLS</option></select></Field>
              : <div />}
            <Field label="Variety / Product *" className="col-span-2"><input className="inp" list="varieties" required value={f.variety} onChange={(e) => set('variety', e.target.value)} placeholder="ভ্যারাইটি লিখুন" /><datalist id="varieties">{varieties.map((v) => <option key={v} value={v} />)}</datalist></Field>
            <Field label="Kg"><input className="inp" type="number" inputMode="decimal" min="0" step="0.01" value={f.kg} onChange={(e) => calc('kg', e.target.value)} placeholder="0" /></Field>
            <Field label="Rate (BDT)"><input className="inp" type="number" inputMode="decimal" min="0" step="0.01" value={f.rate} onChange={(e) => calc('rate', e.target.value)} placeholder="0" /></Field>
            <Field label="Total Amount (BDT) *" className="col-span-2" note={`Kg × Rate = ${money(line)} · চাইলে নিজে লিখতে পারেন`}><input className="inp" type="number" inputMode="decimal" min="0" step="0.01" required value={f.amount} onChange={(e) => { setManual(true); set('amount', e.target.value); }} placeholder="স্বয়ংক্রিয় বা লিখুন" /></Field>
          </div>
        )}
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'সংরক্ষণ হচ্ছে…' : 'লেনদেন সংরক্ষণ'}</button>
      </form>
      <div className="card">
        <h2 className="font-extrabold mb-1">সাম্প্রতিক এন্ট্রি</h2>
        {recent.length === 0 && <Empty>এখনো কোনো লেনদেন নেই</Empty>}
        {recent.map((t) => (
          <div key={t._id} className="flex items-center justify-between gap-3 py-3 border-b border-[#edf1ef] last:border-0">
            <div className="min-w-0"><div className="font-bold text-sm truncate">{cmap[t.customer]?.name || '—'} <span className={`chip ${t.type === 'Sales' ? 'bg-[#edf5f1] text-[#236854]' : 'bg-[#fff4e5] text-[#a65d10]'}`}>{t.type}</span></div><div className="text-[11px] text-slate-500 truncate">{t.date} · {t.portfolio}{t.variety ? ' · ' + t.variety : ''}</div></div>
            <b className="text-sm tabular-nums shrink-0">{money(t.amount)}</b>
          </div>
        ))}
      </div>
    </div>
  );
}
