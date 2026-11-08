'use client'
import { useMemo, useState } from 'react'
import { api } from '@/lib/client'
import {
  PORTFOLIOS,
  varietiesOf,
  optionsOf,
  priceOf,
  packKg,
} from '@/lib/defaults'
import { money } from '@/lib/bn'
import { Field, Seg, Empty } from './ui'

const today = () => new Date().toLocaleDateString('en-CA')
let uid = 0
// Ek ta line = ek ta portfolio/product (Bank Payment e shudhu portfolio + amount)
// variety = dropdown er nam ba '__custom' (nijer lekha nam `custom` e thake). pack = Pack size (Potato te Grade A/B)
const newItem = (portfolio = PORTFOLIOS[0]) => ({
  key: ++uid,
  portfolio,
  variety: '',
  custom: '',
  seedClass: '',
  pack: '',
  grade: '',
  packs: '',
  kg: '',
  rate: '',
  amount: '',
  manual: false,
})
const realVariety = (i) =>
  i.variety === '__custom' ? i.custom.trim() : i.variety
const fmt = (x) => String(+(+x).toFixed(2))
const hasPack = (i) =>
  i.variety && i.variety !== '__custom' && packKg(i.pack) > 0
// Pack count <-> Kg sync: packs prothom priority, na thakle kg theke packs
function syncPacks(n) {
  const pk = hasPack(n) ? packKg(n.pack) : 0
  if (!pk) return n
  if (n.packs !== '') n.kg = fmt((+n.packs || 0) * pk)
  else if (n.kg !== '') n.packs = fmt((+n.kg || 0) / pk)
  return n
}

// Option (seed class / pack) thik kore, price list theke per-kg rate boshay, tarpor Kg × Rate diye amount calculate kore
function fix(i, type, prices) {
  const n = { ...i }
  if (n.variety && n.variety !== '__custom') {
    const o = optionsOf(prices, n.portfolio, n.variety)
    // Inbred Sales e Upshi Grade (FS/CS/TLS) er sathe mile emon seed class er price; onno jaygay prothom class
    const inbredSales = n.portfolio === 'Inbred Rice' && type === 'Sales'
    if (inbredSales) {
      // Grade -> price list er Seed Class (FS = Foundation, CS = Certified, TLS = Quality Declared)
      const key = { FS: 'FOUNDATION', CS: 'CERTIFIED', TLS: 'TLS' }[n.grade]
      // Grade ekhono select hoyni hole prothom class er price provisional boshe
      n.seedClass = n.grade
        ? o.classes.find((c) => c.toUpperCase().includes(key)) || ''
        : o.classes[0] || ''
    } else
      n.seedClass = o.classes.includes(n.seedClass)
        ? n.seedClass
        : o.classes[0] || ''
    const packs = optionsOf(prices, n.portfolio, n.variety, n.seedClass).packs
    if (!packs.includes(n.pack)) n.pack = packs[0] || ''
    const r =
      n.seedClass || !o.classes.length
        ? priceOf(prices, n.portfolio, n.variety, n.seedClass, n.pack)
        : null
    n.rate = r == null ? '' : String(r)
  }
  syncPacks(n)
  if (!n.manual) {
    const a = (+n.kg || 0) * (+n.rate || 0)
    n.amount = a ? String(+a.toFixed(2)) : ''
  }
  return n
}
const blankHead = {
  code: '',
  customer: '',
  date: today(),
  invoice: '',
  bank: '',
  branch: '',
}

export default function Entry({
  openCustomer,
  customers,
  txs,
  prices,
  reload,
  toast,
}) {
  const [type, setType] = useState('Sales')
  const [h, setH] = useState(blankHead)
  const [items, setItems] = useState(() => [newItem()])
  const [busy, setBusy] = useState(false)
  const setHead = (k, v) => setH((p) => ({ ...p, [k]: v }))
  const cmap = useMemo(
    () => Object.fromEntries(customers.map((c) => [c._id, c])),
    [customers],
  )
  const bank = type === 'Bank Payment'
  const total = items.reduce((a, i) => a + (+i.amount || 0), 0)

  const onCode = (v) => {
    const c = customers.find((x) => x.code && x.code === v.trim())
    setH((p) => ({ ...p, code: v, customer: c ? c._id : p.customer }))
  }
  const onCustomer = (id) =>
    setH((p) => ({ ...p, customer: id, code: cmap[id]?.code || '' }))

  // item helpers
  const patch = (key, fn) =>
    setItems((arr) => arr.map((i) => (i.key === key ? fn(i) : i)))
  const setItem = (key, k, v) => patch(key, (i) => ({ ...i, [k]: v }))
  const calc = (key, k, v) =>
    patch(key, (i) => {
      const n = {
        ...i,
        [k]: v,
        ...(k === 'kg' || k === 'rate' || k === 'packs'
          ? { manual: false }
          : {}),
      }
      const pk = hasPack(n) ? packKg(n.pack) : 0
      if (pk && k === 'packs') n.kg = v === '' ? '' : fmt((+v || 0) * pk)
      if (pk && k === 'kg') n.packs = v === '' ? '' : fmt((+v || 0) / pk)
      if (!n.manual) {
        const a = (+n.kg || 0) * (+n.rate || 0)
        n.amount = a ? String(+a.toFixed(2)) : ''
      }
      return n
    })
  // variety / seed class / pack / grade bodlale price abar boshbe (manual amount thakle shetai thakbe)
  const pick = (key, k, v) =>
    patch(key, (i) =>
      fix(
        {
          ...i,
          [k]: v,
          ...(k === 'variety' ? { custom: '', seedClass: '', pack: '' } : {}),
        },
        type,
        prices,
      ),
    )
  const setAmount = (key, v) =>
    patch(key, (i) => ({ ...i, amount: v, manual: true }))
  const changePortfolio = (key, p) =>
    patch(key, (i) =>
      fix(
        {
          ...i,
          portfolio: p,
          variety: '',
          custom: '',
          seedClass: '',
          pack: '',
          grade: '',
          packs: '',
          rate: '',
          manual: false,
        },
        type,
        prices,
      ),
    )
  const addItem = () =>
    // Notun item upore (list-er shurute) add hoy, jate scroll kore niche jete na hoy
    setItems((arr) => [newItem(arr[0]?.portfolio), ...arr])
  const removeItem = (key) =>
    setItems((arr) => (arr.length > 1 ? arr.filter((i) => i.key !== key) : arr))
  const changeType = (t) => {
    setType(t)
    setItems((arr) => arr.map((i) => fix(i, t, prices)))
  }

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const payload = {
        customer: h.customer,
        date: h.date,
        type,
        invoice: h.invoice,
        bank: h.bank,
        branch: h.branch,
        items: [...items].reverse().map((i) => ({
          portfolio: i.portfolio,
          variety: realVariety(i),
          seedClass: i.portfolio === 'Inbred Rice' ? '' : i.seedClass,
          pack: i.pack,
          grade: i.grade,
          kg: i.kg,
          rate: i.rate,
          amount: +i.amount || (+i.kg || 0) * (+i.rate || 0),
        })),
      }
      await api('/api/transactions', { method: 'POST', body: payload })
      toast(
        items.length > 1
          ? `${items.length} টি আইটেম সংরক্ষণ হয়েছে`
          : 'লেনদেন সংরক্ষণ হয়েছে',
      )
      setH((p) => ({
        ...blankHead,
        customer: p.customer,
        code: p.code,
        date: p.date,
      }))
      setItems([newItem(items[0]?.portfolio)])
      await reload()
    } catch (err) {
      toast(err.message, true)
    } finally {
      setBusy(false)
    }
  }
  // Ek invoice / deposit = ek ta entry: batchId diye group kore total dekhano
  const recent = []
  const seen = new Map()
  for (const t of txs) {
    const k = t.batchId || t._id
    let g = seen.get(k)
    if (!g) {
      if (recent.length >= 6) continue
      g = { ...t, total: 0, lines: [] }
      seen.set(k, g)
      recent.push(g)
    }
    g.total += +t.amount || 0
    g.lines.push(t)
  }
  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="card space-y-4">
        <div>
          <h2 className="font-extrabold text-lg">লেনদেন যোগ করুন</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            কাস্টমার কোড লিখুন বা তালিকা থেকে বেছে নিন। একই এন্ট্রিতে একাধিক
            Portfolio যোগ করা যায়।
          </p>
        </div>
        <Seg
          value={type}
          onChange={changeType}
          options={[
            ['Sales', 'Sales'],
            ['MRR', 'MRR · ফেরত'],
            ['Bank Payment', 'Bank Payment'],
          ]}
        />
        <div className="grid grid-cols-[110px_1fr] gap-3">
          <Field label="Code">
            <input
              className="inp"
              inputMode="numeric"
              placeholder="1702"
              value={h.code}
              onChange={(e) => onCode(e.target.value)}
            />
          </Field>
          <Field label="কাস্টমার *">
            <select
              className="inp"
              required
              value={h.customer}
              onChange={(e) => onCustomer(e.target.value)}
            >
              <option value="">নির্বাচন করুন</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.code ? c.code + ' · ' : ''}
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="তারিখ *">
            <input
              className="inp"
              type="date"
              required
              value={h.date}
              onChange={(e) => setHead('date', e.target.value)}
            />
          </Field>
          {bank ? (
            <div />
          ) : (
            <Field
              label={type === 'MRR' ? 'MRR / Invoice No. *' : 'Invoice No. *'}
            >
              <input
                className="inp"
                required
                value={h.invoice}
                onChange={(e) => setHead('invoice', e.target.value)}
                placeholder="ইনভয়েস নম্বর"
              />
            </Field>
          )}
        </div>
        {bank && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bank Name *">
              <input
                className="inp"
                required
                value={h.bank}
                onChange={(e) => setHead('bank', e.target.value)}
                placeholder="ব্যাংকের নাম"
              />
            </Field>
            <Field label="Branch *">
              <input
                className="inp"
                required
                value={h.branch}
                onChange={(e) => setHead('branch', e.target.value)}
                placeholder="শাখা"
              />
            </Field>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div>
            <strong className="text-sm">
              {bank ? 'Portfolio অনুযায়ী টাকা' : 'পণ্যের তথ্য'}
            </strong>
            <div className="text-[11px] text-slate-500">
              {bank
                ? 'একই জমায় একাধিক Portfolio যোগ করুন'
                : 'একই ইনভয়েসে একাধিক Portfolio / পণ্য যোগ করুন'}
            </div>
          </div>
          <button
            type="button"
            className="px-3 min-h-[40px] rounded-xl text-[13px] font-bold bg-[#e8efec] text-brand"
            onClick={addItem}
          >
            ＋ Portfolio যোগ
          </button>
        </div>

        <div className="space-y-3">
          {items.map((it, n) => (
            <div
              key={it.key}
              className="rounded-2xl border border-[#dfe8e4] bg-[#f8fbfa] p-3 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-brand">
                  {bank ? 'জমা' : 'পণ্য'} {items.length - n}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    aria-label="সরান"
                    title="সরান"
                    className="w-8 h-8 rounded-full bg-[#fff1ef] text-[#b43a32] flex items-center justify-center active:scale-95"
                    onClick={() => removeItem(it.key)}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      className="w-4 h-4"
                    >
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                )}
              </div>
              {bank ? (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Portfolio *">
                    <select
                      className="inp"
                      value={it.portfolio}
                      onChange={(e) => changePortfolio(it.key, e.target.value)}
                    >
                      {PORTFOLIOS.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Amount (BDT) *">
                    <input
                      className="inp"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      required
                      value={it.amount}
                      onChange={(e) =>
                        setItem(it.key, 'amount', e.target.value)
                      }
                      placeholder="0"
                    />
                  </Field>
                </div>
              ) : (
                <ItemFields
                  it={it}
                  type={type}
                  prices={prices}
                  pick={pick}
                  calc={calc}
                  setAmount={setAmount}
                  changePortfolio={changePortfolio}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-[#edf5f1] px-4 py-3">
          <span className="text-sm font-bold text-[#236854]">
            এন্ট্রির মোট{items.length > 1 ? ` (${items.length} আইটেম)` : ''}
          </span>
          <b className="tabular-nums text-brand">{money(total)}</b>
        </div>
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? 'সংরক্ষণ হচ্ছে…' : 'লেনদেন সংরক্ষণ'}
        </button>
      </form>
      <div className="card">
        <h2 className="font-extrabold mb-1">সাম্প্রতিক এন্ট্রি</h2>
        {recent.length === 0 && <Empty>এখনো কোনো লেনদেন নেই</Empty>}
        {recent.map((t) => (
          <button
            type="button"
            key={t._id}
            onClick={() => openCustomer(t.customer)}
            className="w-full text-left flex items-center justify-between gap-3 py-3 border-b border-[#edf1ef] last:border-0"
          >
            <div className="min-w-0">
              <div className="font-bold text-sm truncate">
                {cmap[t.customer]?.name || '—'}{' '}
                <span
                  className={`chip ${t.type === 'Sales' ? 'bg-[#edf5f1] text-[#236854]' : 'bg-[#fdecea] text-[#d32f2f]'}`}
                >
                  {t.type}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {t.date}
                {t.invoice ? ' · Invoice: ' + t.invoice : ''}
                {' · ' +
                  [...new Set(t.lines.map((l) => l.portfolio))].join(', ')}
                {t.lines.length > 1
                  ? ` · ${t.lines.length}টি আইটেম`
                  : t.variety
                    ? ' · ' + t.variety
                    : ''}
              </div>
            </div>
            <b
              className={`text-sm tabular-nums shrink-0 ${t.type === 'MRR' ? 'text-[#d32f2f]' : ''}`}
            >
              {money(t.total)}
            </b>
          </button>
        ))}
      </div>
    </div>
  )
}

function ItemFields({
  it,
  type,
  prices,
  pick,
  calc,
  setAmount,
  changePortfolio,
}) {
  const list = varietiesOf(prices, it.portfolio)
  const custom = it.variety === '__custom' || list.length === 0 // price list e nei (jemon Maize) hole nijer lekha
  const o =
    !custom && it.variety
      ? optionsOf(prices, it.portfolio, it.variety, it.seedClass)
      : { classes: [], packs: [] }
  const pot = it.portfolio === 'Potato'
  const listed = !custom && it.rate !== '' && !it.manual
  const packed = hasPack(it),
    pk = packKg(it.pack)
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="Portfolio *">
        <select
          className="inp"
          value={it.portfolio}
          onChange={(e) => changePortfolio(it.key, e.target.value)}
        >
          {PORTFOLIOS.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </Field>
      {it.portfolio === 'Inbred Rice' && type === 'Sales' ? (
        <Field label="Upshi Grade *">
          <select
            className="inp"
            required
            value={it.grade}
            onChange={(e) => pick(it.key, 'grade', e.target.value)}
          >
            <option value="">নির্বাচন</option>
            <option>FS</option>
            <option>CS</option>
            <option>TLS</option>
          </select>
        </Field>
      ) : (
        <div />
      )}
      <Field label="Variety / জাত *" className="col-span-2">
        {list.length > 0 && (
          <select
            className="inp"
            required
            value={it.variety}
            onChange={(e) => pick(it.key, 'variety', e.target.value)}
          >
            <option value="">জাত নির্বাচন করুন</option>
            {list.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
            <option value="__custom">নিজে লিখুন</option>
          </select>
        )}
        {custom && (
          <input
            className={`inp ${list.length ? 'mt-2' : ''}`}
            required
            value={it.custom}
            onChange={(e) => calc(it.key, 'custom', e.target.value)}
            placeholder="ভ্যারাইটির নাম লিখুন"
          />
        )}
      </Field>
      {pot && o.classes.length > 0 && (
        <Field label="Seed Class *" className="col-span-2">
          <select
            className="inp"
            value={it.seedClass}
            onChange={(e) => pick(it.key, 'seedClass', e.target.value)}
          >
            {o.classes.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
      )}
      {o.packs.length > 0 && (
        <Field
          label={pot ? 'Grade *' : 'Pack *'}
          className={pot ? '' : 'col-span-2'}
        >
          <select
            className="inp"
            value={it.pack}
            onChange={(e) => pick(it.key, 'pack', e.target.value)}
          >
            {o.packs.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
      )}
      {packed && (
        <>
          <Field label="Pack সংখ্যা">
            <div className="flex items-stretch gap-1.5">
              <button
                type="button"
                aria-label="কমান"
                className="w-12 shrink-0 rounded-xl bg-[#e8efec] text-brand text-xl font-bold active:scale-95"
                onClick={() =>
                  calc(it.key, 'packs', fmt(Math.max(0, (+it.packs || 0) - 1)))
                }
              >
                −
              </button>
              <input
                className="inp text-center min-w-0 px-1"
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={it.packs}
                onChange={(e) => calc(it.key, 'packs', e.target.value)}
                placeholder="0"
              />
              <button
                type="button"
                aria-label="বাড়ান"
                className="w-12 shrink-0 rounded-xl bg-brand text-white text-xl font-bold active:scale-95"
                onClick={() => calc(it.key, 'packs', fmt((+it.packs || 0) + 1))}
              >
                +
              </button>
            </div>
          </Field>
          <Field
            label="Quantity (Kg)"
            note={it.packs ? `${it.packs} × ${pk} kg` : `প্রতি pack ${pk} kg`}
          >
            <input
              className="inp"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={it.kg}
              onChange={(e) => calc(it.key, 'kg', e.target.value)}
              placeholder="0"
            />
          </Field>
        </>
      )}
      <Field
        label="Rate (BDT / kg)"
        note={
          listed
            ? 'মূল্য তালিকা অনুযায়ী · বদলানো যাবে'
            : custom
              ? 'তালিকায় নেই — নিজে লিখুন'
              : undefined
        }
      >
        <input
          className="inp"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={it.rate}
          onChange={(e) => calc(it.key, 'rate', e.target.value)}
          placeholder="0"
        />
      </Field>
      {packed ? (
        <Field label={`১টি ${pk} kg pack-এর দাম`} note="Rate × pack weight">
          <input
            className="inp"
            readOnly
            tabIndex={-1}
            value={it.rate ? money(+it.rate * pk) : ''}
            placeholder="—"
          />
        </Field>
      ) : (
        <Field label="Quantity (Kg)">
          <input
            className="inp"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={it.kg}
            onChange={(e) => calc(it.key, 'kg', e.target.value)}
            placeholder="0"
          />
        </Field>
      )}
      <Field
        label="Total Amount (BDT) *"
        className="col-span-2"
        note={`${packed && it.packs ? it.packs + ' pack × ' + pk + ' kg × ' + money(+it.rate || 0) + ' = ' : 'Kg × Rate = '}${money((+it.kg || 0) * (+it.rate || 0))} · চাইলে নিজে লিখতে পারেন`}
      >
        <input
          className="inp"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          required
          value={it.amount}
          onChange={(e) => setAmount(it.key, e.target.value)}
          placeholder="স্বয়ংক্রিয় বা লিখুন"
        />
      </Field>
    </div>
  )
}
