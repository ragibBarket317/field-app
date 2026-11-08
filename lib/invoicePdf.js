import { money } from './bn';
import { summarize } from './calc';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fileName = (name) => (String(name).replace(/[\\/:*?"<>|]+/g, '').trim().replace(/\s+/g, '_') || 'customer') + '_invoice.pdf';
const n = (v) => (Number(v) || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });

export async function downloadInvoice(customer, txs) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas-pro'), import('jspdf')]);
  const sorted = [...txs].sort((a, b) => a.date.localeCompare(b.date));
  // Same-invoice sales rows ko ekshathe rakhi jate Invoice Total merge kora jay
  const inv = (t) => (t.type === 'Sales' && t.invoice ? String(t.invoice).trim() : '');
  const groups = new Map();
  sorted.forEach((t) => { const k = inv(t); if (k) groups.set(k, [...(groups.get(k) || []), t]); });
  const list = [], seen = new Set();
  sorted.forEach((t) => {
    const k = inv(t);
    if (!k) return list.push(t);
    if (seen.has(k)) return;
    seen.add(k); list.push(...groups.get(k));
  });
  const S = summarize(list);
  const th = 'padding:7px 6px;text-align:left;background:#113b36;color:#fff;font-size:11px;';
  const td = 'padding:6px;border-bottom:1px solid #e3ebe7;font-size:11px;vertical-align:top;';
  const r = 'text-align:right;white-space:nowrap;';
  const rows = list.map((t, idx) => {
    const sale = t.type === 'Sales';
    const desc = sale || t.type === 'MRR' ? `${esc(t.variety)}${[t.seedClass, t.grade, t.pack].filter(Boolean).length ? ' (' + [t.seedClass, t.grade, t.pack].filter(Boolean).map(esc).join(' · ') + ')' : ''}${t.kg ? `<br><span style="color:#62736f">${n(t.kg)} kg × ${n(t.rate)}</span>` : ''}` : `${esc(t.bank)}, ${esc(t.branch)}`;
    const k = inv(t);
    let totalCell = '';
    if (sale && !k) totalCell = `<td style="${td}${r}text-align:center;vertical-align:middle;font-weight:700">${n(t.amount)}</td>`;
    else if (k && !(idx > 0 && inv(list[idx - 1]) === k)) {
      const g = groups.get(k);
      totalCell = `<td rowspan="${g.length}" style="${td}${r}text-align:center;vertical-align:middle;font-weight:700;background:#f2faf6;border-left:1px solid #e3ebe7">${n(g.reduce((a, x) => a + (Number(x.amount) || 0), 0))}</td>`;
    } else if (!sale) totalCell = `<td style="${td}"></td>`;
    return `<tr><td style="${td}">${esc(t.date)}</td><td style="${td}">${esc(t.type)}</td><td style="${td}">${esc(t.invoice) || '—'}</td><td style="${td}">${esc(t.portfolio)}</td><td style="${td}">${desc}</td><td style="${td}${r}">${sale ? n(t.amount) : ''}</td>${totalCell}<td style="${td}${r}">${sale ? '' : n(t.amount)}</td></tr>`;
  }).join('');
  const port = S.rows.filter((x) => x.s || x.c).map((x) => `<tr><td style="${td}">${x.p}</td><td style="${td}${r}">${n(x.s)}</td><td style="${td}${r}">${n(x.c)}</td><td style="${td}${r}font-weight:700">${n(x.o)}</td></tr>`).join('');

  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;background:#fff;color:#162a28;padding:36px 34px;font-family:system-ui,-apple-system,"Noto Sans Bengali",Arial,sans-serif;box-sizing:border-box;';
  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #126b58;padding-bottom:14px">
      <div><div style="font-size:21px;font-weight:800;color:#113b36">Supreme Seed Company Limited</div><div style="font-size:12px;color:#62736f;margin-top:3px">Hatikumrul Region</div></div>
      <div style="text-align:right"><div style="font-size:24px;font-weight:800;color:#126b58;letter-spacing:.05em">INVOICE</div><div style="font-size:11px;color:#62736f;margin-top:3px">Date: ${new Date().toLocaleDateString('en-GB')}</div></div>
    </div>
    <div style="margin:18px 0;padding:12px 14px;background:#f2faf6;border-radius:10px">
      <div style="font-size:10px;color:#62736f;letter-spacing:.08em">BILLED TO</div>
      <div style="font-size:17px;font-weight:800;margin-top:3px">${esc(customer.name)}</div>
      <div style="font-size:12px;color:#435751;margin-top:3px">Code: ${esc(customer.code || '—')}${customer.address ? ' · ' + esc(customer.address) : ''}</div>
    </div>
    <table style="width:100%;border-collapse:collapse"><thead><tr>
      <th style="${th}">Date</th><th style="${th}">Type</th><th style="${th}">Invoice</th><th style="${th}">Portfolio</th><th style="${th}">Details</th><th style="${th}${r}">Sales (BDT)</th><th style="${th}text-align:center;white-space:nowrap;">Invoice Total</th><th style="${th}${r}">Collection (BDT)</th></tr></thead>
      <tbody>${rows || `<tr><td colspan="8" style="${td}text-align:center;color:#62736f">No transactions</td></tr>`}</tbody></table>
    <div style="display:flex;gap:18px;margin-top:20px;align-items:flex-start">
      <table style="flex:1;border-collapse:collapse"><thead><tr><th style="${th}">Portfolio</th><th style="${th}${r}">Sales</th><th style="${th}${r}">Collection</th><th style="${th}${r}">Outstanding</th></tr></thead><tbody>${port}</tbody></table>
      <div style="width:250px;border:1px solid #dce6e2;border-radius:10px;padding:12px;font-size:12px">
        <div style="display:flex;justify-content:space-between;padding:4px 0"><span>Total Sales</span><b>${money(S.sales)}</b></div>
        <div style="display:flex;justify-content:space-between;padding:4px 0"><span>Collection (MRR + Bank)</span><b>${money(S.col)}</b></div>
        <div style="display:flex;justify-content:space-between;padding:8px 0 0;margin-top:6px;border-top:2px solid #126b58;font-size:14px;color:#126b58"><b>Outstanding</b><b>${money(S.out)}</b></div>
      </div>
    </div>
    <div style="margin-top:26px;font-size:10px;color:#8a9a95;text-align:center">Outstanding = Sales − MRR − Bank Payment</div>`;
  document.body.append(el);
  try {
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
    const pageHpx = Math.floor((canvas.width * ph) / pw);
    for (let y = 0, i = 0; y < canvas.height; y += pageHpx, i++) {
      const slice = document.createElement('canvas');
      slice.width = canvas.width; slice.height = Math.min(pageHpx, canvas.height - y);
      slice.getContext('2d').drawImage(canvas, 0, y, canvas.width, slice.height, 0, 0, canvas.width, slice.height);
      if (i) pdf.addPage();
      pdf.addImage(slice.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pw, (slice.height * pw) / canvas.width);
    }
    pdf.save(fileName(customer.name));
  } finally { el.remove(); }
}
