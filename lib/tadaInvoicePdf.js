import { EXPENSE_CATEGORIES } from './defaults';
import { bn, BN_MONTHS } from './bn';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const n = (v) => (Number(v) || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });
const EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export async function downloadTadaInvoice(month, entries, saved) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas-pro'), import('jspdf')]);
  const [y, m] = month.split('-').map(Number);
  const list = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const exps = EXPENSE_CATEGORIES.map((c) => ({ c, v: saved?.expenses?.[c.key] || {} })).filter((x) => +x.v.amount > 0);
  const km = list.reduce((a, e) => a + e.usedKm, 0), food = list.reduce((a, e) => a + e.allowance, 0), trav = list.reduce((a, e) => a + e.travelExpense, 0);
  const other = exps.reduce((a, x) => a + +x.v.amount, 0), grand = food + trav + other;

  const th = 'padding:7px 6px;text-align:left;background:#113b36;color:#fff;font-size:11px;';
  const td = 'padding:6px;border-bottom:1px solid #e3ebe7;font-size:11px;vertical-align:top;';
  const r = 'text-align:right;white-space:nowrap;';
  const tot = 'padding:7px 6px;background:#f2faf6;font-weight:800;font-size:11px;';
  const trips = list.map((e) => `<tr><td style="${td}">${e.date.slice(8)}/${e.date.slice(5, 7)}</td><td style="${td}">${esc(e.endPlace)}${e.activity ? `<br><span style="color:#62736f">${esc(e.activity)}</span>` : ''}</td><td style="${td}">${esc(e.startTime)}–${esc(e.endTime)}</td><td style="${td}${r}">${n(e.usedKm)}</td><td style="${td}${r}">${n(e.allowance)}</td><td style="${td}${r}">${n(e.travelExpense)}</td><td style="${td}">${esc(e.voucher) || '—'}</td></tr>`).join('');
  const exRows = exps.map(({ c, v }) => `<tr><td style="${td}">${esc(c.custom ? v.label || c.label : c.label)}</td><td style="${td}${r}">${n(v.amount)}</td><td style="${td}">${esc(v.voucher) || '—'}</td><td style="${td}">${esc(v.remark)}</td></tr>`).join('');
  const sum = (a, b, strong) => `<div style="display:flex;justify-content:space-between;padding:${strong ? '8px 0 0;margin-top:6px;border-top:2px solid #126b58;font-size:14px;color:#126b58' : '4px 0'}"><${strong ? 'b' : 'span'}>${a}</${strong ? 'b' : 'span'}><b>${b}</b></div>`;

  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;background:#fff;color:#162a28;padding:36px 34px;font-family:system-ui,-apple-system,"Noto Sans Bengali",Arial,sans-serif;box-sizing:border-box;';
  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #126b58;padding-bottom:14px">
      <div><div style="font-size:21px;font-weight:800;color:#113b36">সুপ্রিম সীড কোম্পানি লিমিটেড</div><div style="font-size:12px;color:#62736f;margin-top:3px">দৈনিক ভাতা / ভ্রমণ ভাতা ও মাসিক খরচ</div></div>
      <div style="text-align:right"><div style="font-size:22px;font-weight:800;color:#126b58;letter-spacing:.05em">TA/DA INVOICE</div><div style="font-size:12px;color:#435751;margin-top:3px">${BN_MONTHS[m - 1]} ${bn(y)}</div></div>
    </div>
    <div style="margin:16px 0;padding:12px 14px;background:#f2faf6;border-radius:10px;font-size:12px;line-height:1.7">
      <b style="font-size:15px">মোঃ রিশাদুর রহমান</b><br>রিজিওনাল ম্যানেজার · হাটিকুমরুল · 01841-145117
    </div>
    <div style="font-size:13px;font-weight:800;margin:6px 0">ভ্রমণের বিবরণ</div>
    <table style="width:100%;border-collapse:collapse"><thead><tr><th style="${th}">তারিখ</th><th style="${th}">স্থান / কাজ</th><th style="${th}">সময়</th><th style="${th}${r}">কিমি</th><th style="${th}${r}">খাদ্য/হোটেল</th><th style="${th}${r}">যানবাহন</th><th style="${th}">ভাউচার</th></tr></thead>
      <tbody>${trips || `<tr><td colspan="7" style="${td}text-align:center;color:#62736f">কোনো ভ্রমণ নেই</td></tr>`}
      <tr><td colspan="3" style="${tot}">মোট</td><td style="${tot}${r}">${n(km)}</td><td style="${tot}${r}">${n(food)}</td><td style="${tot}${r}">${n(trav)}</td><td style="${tot}"></td></tr></tbody></table>
    <div style="font-size:13px;font-weight:800;margin:20px 0 6px">মাসিক অন্যান্য খরচ</div>
    <table style="width:100%;border-collapse:collapse"><thead><tr><th style="${th}">খাত</th><th style="${th}${r}">টাকা</th><th style="${th}">ভাউচার</th><th style="${th}">মন্তব্য</th></tr></thead>
      <tbody>${exRows || `<tr><td colspan="4" style="${td}text-align:center;color:#62736f">কোনো মাসিক খরচ নেই</td></tr>`}
      <tr><td style="${tot}">মোট</td><td style="${tot}${r}">${n(other)}</td><td colspan="2" style="${tot}"></td></tr></tbody></table>
    ${saved?.monthComment ? `<div style="margin-top:12px;font-size:11px;color:#435751"><b>মন্তব্য:</b> ${esc(saved.monthComment)}</div>` : ''}
    <div style="width:300px;margin:22px 0 0 auto;border:1px solid #dce6e2;border-radius:10px;padding:12px;font-size:12px">
      ${sum('মোট ভ্রমণ (কিমি)', n(km))}${sum('খাদ্য/হোটেল ভাতা', n(food))}${sum('যানবাহন/ভ্রমণ খরচ', n(trav))}${sum('মাসিক অন্যান্য খরচ', n(other))}${sum('সর্বমোট (টাকা)', n(grand), true)}
    </div>`;
  document.body.append(el);
  try {
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
    const pageHpx = Math.floor((canvas.width * ph) / pw);
    for (let yy = 0, i = 0; yy < canvas.height; yy += pageHpx, i++) {
      const slice = document.createElement('canvas');
      slice.width = canvas.width; slice.height = Math.min(pageHpx, canvas.height - yy);
      slice.getContext('2d').drawImage(canvas, 0, yy, canvas.width, slice.height, 0, 0, canvas.width, slice.height);
      if (i) pdf.addPage();
      pdf.addImage(slice.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pw, (slice.height * pw) / canvas.width);
    }
    pdf.save(`TADA_Invoice_${EN[m - 1]}_${y}.pdf`);
  } finally { el.remove(); }
}
