import { PORTFOLIOS } from './defaults';
const add = (txs) => txs.reduce((a, t) => a + (+t.amount || 0), 0);
export function summarize(txs) {
  const rows = PORTFOLIOS.map((p) => {
    const pt = txs.filter((t) => t.portfolio === p);
    const s = add(pt.filter((t) => t.type === 'Sales')), c = add(pt.filter((t) => t.type !== 'Sales'));
    return { p, s, c, o: s - c };
  });
  const sales = add(txs.filter((t) => t.type === 'Sales')), col = add(txs.filter((t) => t.type !== 'Sales'));
  return { rows, sales, col, out: sales - col, count: txs.length };
}
