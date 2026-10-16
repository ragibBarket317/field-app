const D = '০১২৩৪৫৬৭৮৯';
export const bn = (v) => String(v ?? '').replace(/\d/g, (d) => D[+d]);
export const bnDate = (iso) => { const [y, m, d] = String(iso || '').split('-'); return y && m && d ? `${bn(d)}/${bn(m)}/${bn(y)}` : ''; };
export const BN_MONTHS = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
export const taka = (n) => '৳' + bn(Math.round(Number(n) || 0).toLocaleString('en-US'));
export const money = (n) => '৳ ' + (Number(n) || 0).toLocaleString('en-BD', { maximumFractionDigits: 2 });
