'use client';
import { summarize } from '@/lib/calc';
import { money } from '@/lib/bn';
import { saveBlob } from '@/lib/client';
import { PORTFOLIOS } from '@/lib/defaults';
import { Metric, Empty } from './ui';

export default function Home({ customers, txs, openCustomer, toast }) {
  const S = summarize(txs);
  const byCustomer = customers.map((c) => ({ c, s: summarize(txs.filter((t) => t.customer === c._id)) })).sort((a, b) => b.s.out - a.s.out);
  const exportCsv = () => {
    const cmap = Object.fromEntries(customers.map((c) => [c._id, c]));
    const heads = ['Date', 'Customer Code', 'Customer Name', 'Transaction Type', 'Invoice No.', 'Variety / Product', 'Grade', 'Kg', 'Rate (BDT)', 'Amount (BDT)', 'Bank Name', 'Branch', ...PORTFOLIOS.map((x) => x + ' Sales (BDT)'), ...PORTFOLIOS.map((x) => x + ' Collection / MRR (BDT)'), 'Notes'];
    const rows = [...txs].reverse().map((t) => {
      const c = cmap[t.customer] || {}, sale = Array(5).fill(''), coll = Array(5).fill(''), i = PORTFOLIOS.indexOf(t.portfolio);
      if (i >= 0) (t.type === 'Sales' ? sale : coll)[i] = t.amount;
      return [t.date, c.code, c.name, t.type, t.invoice, t.variety, t.grade, t.kg || '', t.rate || '', t.amount, t.bank, t.branch, ...sale, ...coll, t.notes];
    });
    const q = (x) => '"' + String(x ?? '').replaceAll('"', '""') + '"';
    saveBlob(new Blob(['\ufeff' + [heads, ...rows].map((r) => r.map(q).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }), 'Customer_Transactions.csv');
    toast('CSV ডাউনলোড হয়েছে');
  };
  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-gradient-to-br from-brand-dark to-brand text-white p-5 shadow-card">
        <div className="text-xs opacity-80">মোট Outstanding</div>
        <div className="text-3xl font-extrabold mt-1 tabular-nums">{money(S.out)}</div>
        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
          <div className="bg-white/10 rounded-xl p-3"><div className="text-[11px] opacity-80">Sales</div><b className="tabular-nums">{money(S.sales)}</b></div>
          <div className="bg-white/10 rounded-xl p-3"><div className="text-[11px] opacity-80">Collection (MRR + Bank)</div><b className="tabular-nums">{money(S.col)}</b></div>
        </div>
      </div>
      <div className="card">
        <h2 className="font-extrabold mb-3">Portfolio হিসাব</h2>
        <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-2 text-[11px] font-bold text-slate-500 bg-[#f7faf8] rounded-lg px-2 py-2"><span>Portfolio</span><span className="text-right">Sales</span><span className="text-right">Collection</span></div>
        {S.rows.map((x) => <div key={x.p} className="grid grid-cols-[1.2fr_1fr_1fr] gap-2 text-[13px] px-2 py-2.5 border-b border-[#edf1ef] last:border-0"><span className="font-semibold">{x.p}</span><span className="text-right tabular-nums">{money(x.s)}</span><span className="text-right tabular-nums">{money(x.c)}</span></div>)}
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-2"><h2 className="font-extrabold">কাস্টমারভিত্তিক Outstanding</h2><button onClick={exportCsv} className="btn-soft !min-h-[38px] !text-xs !px-3">CSV</button></div>
        {byCustomer.length === 0 && <Empty>কোনো কাস্টমার নেই</Empty>}
        {byCustomer.map(({ c, s }) => (
          <button key={c._id} onClick={() => openCustomer(c._id)} className="w-full flex items-center justify-between gap-3 py-3 border-b border-[#edf1ef] last:border-0 text-left">
            <div className="min-w-0"><div className="font-bold text-sm truncate">{c.name}</div><div className="text-[11px] text-slate-500">{c.code || 'কোড নেই'} · Sales {money(s.sales)}</div></div>
            <b className={`text-sm tabular-nums shrink-0 ${s.out > 0 ? 'text-[#b43a32]' : 'text-brand'}`}>{money(s.out)}</b>
          </button>
        ))}
      </div>
    </div>
  );
}
