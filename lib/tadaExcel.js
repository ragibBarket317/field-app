import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { bn, bnDate, BN_MONTHS } from './bn';

const esc = (s) => String(s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const colNum = (ref) => [...ref.match(/^[A-Z]+/)[0]].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0);

// Sets one cell's content while keeping the template style (s="..."), merges and sizes untouched.
function setCell(xml, ref, value, { formula = null, cache = null } = {}) {
  const re = new RegExp(`<c\\b(?=[^>]*\\br="${ref}")[^>]*?(?:/>|>[\\s\\S]*?</c>)`);
  const old = xml.match(re);
  let attrs = old ? old[0].match(/<c\b([^>]*?)\/?>/)[1] : ` r="${ref}"`;
  attrs = attrs.replace(/\s+t="[^"]*"/g, '').replace(/\/\s*$/, '');
  let body = '', t = '';
  if (formula !== null) { body = `<f>${esc(formula)}</f><v>${cache ?? ''}</v>`; if (cache !== null) t = ' t="n"'; }
  else if (value !== null && value !== undefined && value !== '') {
    if (typeof value === 'number') { body = `<v>${value}</v>`; t = ' t="n"'; }
    else { body = `<is><t xml:space="preserve">${esc(value)}</t></is>`; t = ' t="inlineStr"'; }
  }
  const fresh = `<c${attrs}${t}>${body}</c>`;
  if (old) return xml.replace(old[0], () => fresh);
  const row = ref.match(/\d+$/)[0];
  const rm = xml.match(new RegExp(`<row\\b([^>]*\\br="${row}"[^>]*)>([\\s\\S]*?)</row>`));
  if (!rm) throw new Error('Template row missing for ' + ref);
  const cells = [...rm[2].matchAll(/<c\b[^>]*?(?:\/>|>[\s\S]*?<\/c>)/g)];
  let out = '', cur = 0, done = false;
  for (const m of cells) {
    const other = m[0].match(/\br="([A-Z]+\d+)"/)?.[1];
    if (other && colNum(other) > colNum(ref)) { out += rm[2].slice(cur, m.index) + fresh; cur = m.index; done = true; break; }
    out += rm[2].slice(cur, m.index) + m[0]; cur = m.index + m[0].length;
  }
  out += done ? rm[2].slice(cur) : rm[2].slice(cur) + fresh;
  return xml.replace(rm[0], () => `<row${rm[1]}>${out}</row>`);
}

const num = (n) => bn(Number(n).toLocaleString('en-US'));

export async function buildTadaWorkbook(month, entries, officer = {}) {
  const [year, mon] = month.split('-').map(Number);
  const list = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  if (list.length > 31) throw new Error('সর্বোচ্চ ৩১টি ভ্রমণ-স্লট আছে');
  const zip = await JSZip.loadAsync(fs.readFileSync(path.join(process.cwd(), 'templates', 'tada-template.xlsx')));

  // force a clean recalculation in Excel (drop the stale calc chain)
  zip.remove('xl/calcChain.xml');
  const ct = (await zip.file('[Content_Types].xml').async('string')).replace(/<Override[^>]*calcChain[^>]*\/>/, '');
  zip.file('[Content_Types].xml', ct);
  const rel = (await zip.file('xl/_rels/workbook.xml.rels').async('string')).replace(/<Relationship [^>]*calcChain[^>]*\/>/, '');
  zip.file('xl/_rels/workbook.xml.rels', rel);
  let wb = await zip.file('xl/workbook.xml').async('string');
  wb = /<calcPr/.test(wb) ? wb.replace(/<calcPr([^>]*?)\/>/, (m, a) => `<calcPr${a.replace(/\s*fullCalcOnLoad="[^"]*"/, '')} fullCalcOnLoad="1"/>`) : wb.replace('</workbook>', '<calcPr fullCalcOnLoad="1"/></workbook>');
  zip.file('xl/workbook.xml', wb);

  let tKm = 0, tFood = 0, tTravel = 0;
  for (let si = 0; si < 3; si++) {
    const p = `xl/worksheets/sheet${si + 1}.xml`;
    let xml = await zip.file(p).async('string');
    xml = setCell(xml, 'L2', BN_MONTHS[mon - 1]);
    xml = setCell(xml, 'L3', bn(year));
    if (officer.name) xml = setCell(xml, 'C2', officer.name);
    if (si > 0) {
      xml = setCell(xml, 'F8', num(tKm));
      xml = setCell(xml, 'G8', null, { formula: `Sheet${si}!G${si === 1 ? 29 : 29}`, cache: tFood });
      xml = setCell(xml, 'H8', null, { formula: `Sheet${si}!H29`, cache: tTravel });
    }
    const slots = si === 2 ? 11 : 10;
    const page = list.slice(si * 10, si * 10 + slots);
    for (let i = 0; i < slots; i++) {
      const r = 9 + 2 * i, e = page[i];
      if (e) {
        xml = setCell(xml, `A${r}`, bnDate(e.date));
        xml = setCell(xml, `C${r}`, bn(e.startTime)); xml = setCell(xml, `C${r + 1}`, bn(e.endTime));
        xml = setCell(xml, `D${r}`, 'হাটিকুমরুল ডিপো অফিস'); xml = setCell(xml, `D${r + 1}`, bn(e.endPlace));
        xml = setCell(xml, `E${r}`, num(e.startOdo)); xml = setCell(xml, `E${r + 1}`, num(e.endOdo));
        xml = setCell(xml, `F${r}`, num(e.usedKm));
        xml = setCell(xml, `G${r}`, +e.allowance || 0); xml = setCell(xml, `H${r}`, +e.travelExpense || 0);
        xml = setCell(xml, `I${r}`, e.voucher ? bn(e.voucher) : ''); xml = setCell(xml, `J${r}`, e.activity ? bn(e.activity) : '');
        tKm += e.usedKm; tFood += +e.allowance || 0; tTravel += +e.travelExpense || 0;
      } else { // clear sample data left in the template
        for (const c of ['A', 'F', 'G', 'H', 'I', 'J']) xml = setCell(xml, `${c}${r}`, '');
        for (const c of ['C', 'D', 'E']) { xml = setCell(xml, `${c}${r}`, ''); xml = setCell(xml, `${c}${r + 1}`, ''); }
      }
    }
    const tr = si === 2 ? 31 : 29, er = si === 2 ? 30 : 28;
    xml = setCell(xml, `F${tr}`, num(tKm));
    xml = setCell(xml, `G${tr}`, null, { formula: `SUM(G8:G${er})`, cache: tFood });
    xml = setCell(xml, `H${tr}`, null, { formula: `SUM(H8:H${er})`, cache: tTravel });
    zip.file(p, xml);
  }
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}
