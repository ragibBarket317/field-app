import { PORTFOLIOS } from './defaults';
const add = (txs) => txs.reduce((a, t) => a + (+t.amount || 0), 0);
export const kgFmt = (n) => (+(+n || 0).toFixed(2)).toLocaleString('en-IN') + ' kg';
export function summarize(txs) {
  const rows = PORTFOLIOS.map((p) => {
    const pt = txs.filter((t) => t.portfolio === p);
    const s = add(pt.filter((t) => t.type === 'Sales')), c = add(pt.filter((t) => t.type !== 'Sales'));
    // Placement = Sales kg - MRR (ferot) kg
    const kg = pt.reduce((a, t) => a + (t.type === 'Sales' ? +t.kg || 0 : t.type === 'MRR' ? -(+t.kg || 0) : 0), 0);
    return { p, s, c, o: s - c, kg };
  });
  const sales = add(txs.filter((t) => t.type === 'Sales')), col = add(txs.filter((t) => t.type !== 'Sales'));
  return { rows, sales, col, out: sales - col, count: txs.length };
}
