'use client'
import { useMemo, useState } from 'react'
import { api } from '@/lib/client'
import { PORTFOLIOS, packKg } from '@/lib/defaults'
import { money } from '@/lib/bn'
import { Icon, ICONS, Field, Empty } from './ui'

const blank = (portfolio = PORTFOLIOS[0]) => ({
  portfolio,
  variety: '',
  seedClass: '',
  pack: '',
  price: '',
})

export default function Prices({ prices, reload, toast }) {
  const [form, setForm] = useState(null) // {id?, portfolio, variety, seedClass, pack, price}
  const [filter, setFilter] = useState('All')
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const list = useMemo(
    () =>
      prices.filter(
        (p) =>
          (filter === 'All' || p.portfolio === filter) &&
          (p.variety + ' ' + p.seedClass + ' ' + p.pack)
            .toLowerCase()
            .includes(q.trim().toLowerCase()),
      ),
    [prices, filter, q],
  )
  // Portfolio -> Variety -> rows
  const groups = useMemo(() => {
    const out = []
    for (const p of list) {
      let g = out.find((x) => x.portfolio === p.portfolio)
      if (!g) out.push((g = { portfolio: p.portfolio, varieties: [] }))
      let v = g.varieties.find((x) => x.name === p.variety)
      if (!v) g.varieties.push((v = { name: p.variety, rows: [] }))
      v.rows.push(p)
    }
    return out.sort(
      (a, b) =>
        PORTFOLIOS.indexOf(a.portfolio) - PORTFOLIOS.indexOf(b.portfolio),
    )
  }, [list])
  const count = (p) => prices.filter((x) => x.portfolio === p).length

  // Form er datalist suggestion (ager dewa nam gulo abar na lekha)
  const sug = useMemo(() => {
    if (!form) return { v: [], c: [], k: [] }
    const same = prices.filter((p) => p.portfolio === form.portfolio)
    const u = (a) => [...new Set(a.filter(Boolean))]
    return {
      v: u(same.map((p) => p.variety)),
      c: u(same.map((p) => p.seedClass)),
      k: u(same.map((p) => p.pack)),
    }
  }, [prices, form?.portfolio])

  async function save(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const body = {
        portfolio: form.portfolio,
        variety: form.variety,
        seedClass: form.seedClass,
        pack: form.pack,
        price: form.price,
      }
      if (form.id) await api(`/api/prices/${form.id}`, { method: 'PUT', body })
      else await api('/api/prices', { method: 'POST', body })
      toast('মূল্য সংরক্ষিত')
      // নতুন হলে ফর্ম খোলা থাকবে (একই জাত/class রেখে পরের pack দেওয়ার জন্য)
      setForm(
        form.id
          ? null
          : {
              ...blank(form.portfolio),
              variety: form.variety,
              seedClass: form.seedClass,
            },
      )
      await reload()
    } catch (err) {
      toast(err.message, true)
    } finally {
      setBusy(false)
    }
  }
  async function del(p) {
    if (
      !confirm(
        `${p.variety}${p.seedClass ? ' · ' + p.seedClass : ''} · ${p.pack} এর দাম মুছে ফেলবেন?`,
      )
    )
      return
    try {
      await api(`/api/prices/${p._id}`, { method: 'DELETE' })
      await reload()
      toast('মুছে ফেলা হয়েছে')
    } catch (e) {
      toast(e.message, true)
    }
  }

  const pk = form ? packKg(form.pack) : 0,
    pr = +form?.price || 0
  return (
    <div className="space-y-4">
      {!form && (
        <button
          className="btn-primary w-full"
          onClick={() => {
            setForm(blank(filter === 'All' ? undefined : filter))
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          <Icon d={ICONS.plus} className="w-5 h-5" />
          নতুন মূল্য যোগ করুন
        </button>
      )}

      {form && (
        <form onSubmit={save} className="card space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-extrabold">
                {form.id ? 'মূল্য সম্পাদনা' : 'নতুন মূল্য'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                এখানে যা দেবেন তা এন্ট্রি ফর্মের ড্রপডাউনে দেখাবে।
              </p>
            </div>
            <button
              type="button"
              aria-label="বন্ধ করুন"
              className="w-8 h-8 shrink-0 rounded-full bg-[#eef3f1] text-[#53645f] flex items-center justify-center"
              onClick={() => setForm(null)}
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
          </div>
          <Field label="Portfolio *">
            <select
              className="inp"
              value={form.portfolio}
              onChange={(e) => set('portfolio', e.target.value)}
            >
              {PORTFOLIOS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="Variety / জাত *">
            <input
              className="inp"
              required
              list="pv"
              value={form.variety}
              onChange={(e) => set('variety', e.target.value)}
              placeholder="যেমন Hira-2"
            />
            <datalist id="pv">
              {sug.v.map((x) => (
                <option key={x} value={x} />
              ))}
            </datalist>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Seed Class" note="ঐচ্ছিক">
              <input
                className="inp"
                list="pc"
                value={form.seedClass}
                onChange={(e) => set('seedClass', e.target.value)}
                placeholder="যেমন Foundation Seed"
              />
              <datalist id="pc">
                {sug.c.map((x) => (
                  <option key={x} value={x} />
                ))}
              </datalist>
            </Field>
            <Field label="Grade / Pack *" note="যেমন 10 kg pack বা Grade A">
              <input
                className="inp"
                required
                list="pk"
                value={form.pack}
                onChange={(e) => set('pack', e.target.value)}
                placeholder="10 kg pack"
              />
              <datalist id="pk">
                {sug.k.map((x) => (
                  <option key={x} value={x} />
                ))}
              </datalist>
            </Field>
          </div>
          <Field
            label="Per kg price (BDT) *"
            note={
              pk && pr
                ? `১টি ${pk} kg pack = ${money(pr * pk)} (প্রতি কেজি ${money(pr)})`
                : 'pack এর নামে "kg" লিখলে (যেমন 10 kg pack) এন্ট্রিতে pack সংখ্যা দিয়ে হিসাব হবে'
            }
          >
            <input
              className="inp"
              required
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              placeholder="0"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setForm(null)}
            >
              {form.id ? 'বাতিল' : 'শেষ'}
            </button>
            <button className="btn-primary" disabled={busy}>
              {busy ? 'সংরক্ষণ…' : form.id ? 'আপডেট' : 'সংরক্ষণ'}
            </button>
          </div>
          {!form.id && (
            <p className="text-[11px] text-slate-500 -mt-1">
              সংরক্ষণের পর ফর্ম খোলা থাকবে — একই জাতের আরেকটি pack/grade সহজে
              যোগ করা যাবে।
            </p>
          )}
        </form>
      )}

      <div className="space-y-2.5">
        <input
          className="inp"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="জাত, class বা pack খুঁজুন"
        />
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-0.5 px-0.5">
          {['All', ...PORTFOLIOS].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFilter(p)}
              className={`shrink-0 rounded-full px-3.5 min-h-[38px] text-[13px] font-bold border ${filter === p ? 'bg-brand text-white border-brand' : 'bg-white text-[#435751] border-[#cad8d2]'}`}
            >
              {p === 'All' ? 'সব' : p}{' '}
              <span className={filter === p ? 'opacity-80' : 'text-slate-400'}>
                {p === 'All' ? prices.length : count(p)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 && (
        <div className="card">
          <Empty>কোনো মূল্য পাওয়া যায়নি</Empty>
        </div>
      )}
      {groups.map((g) => (
        <div key={g.portfolio} className="card !p-0 overflow-hidden">
          <div className="px-4 py-3 bg-[#edf5f1] font-extrabold text-sm text-[#236854]">
            {g.portfolio}
          </div>
          {g.varieties.map((v) => (
            <div key={v.name} className="px-4 py-3 border-t border-[#edf1ef]">
              <div className="font-bold text-sm mb-1.5">{v.name}</div>
              {v.rows.map((p) => {
                const k = packKg(p.pack)
                return (
                  <div key={p._id} className="flex items-center gap-2 py-1.5">
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] text-[#435751] truncate">
                        {[p.seedClass, p.pack].filter(Boolean).join(' · ')}
                      </div>
                      {k > 0 && (
                        <div className="text-[11px] text-slate-500">
                          ১টি pack = {money(p.price * k)}
                        </div>
                      )}
                    </div>
                    <b className="text-sm tabular-nums shrink-0">
                      {money(p.price)}
                      <span className="text-[10px] font-semibold text-slate-500">
                        {' '}
                        /kg
                      </span>
                    </b>
                    <button
                      type="button"
                      aria-label="সম্পাদনা"
                      className="w-9 h-9 shrink-0 rounded-xl bg-[#e8efec] text-brand grid place-items-center"
                      onClick={() => {
                        setForm({
                          id: p._id,
                          portfolio: p.portfolio,
                          variety: p.variety,
                          seedClass: p.seedClass || '',
                          pack: p.pack,
                          price: String(p.price),
                        })
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                    >
                      <Icon d={ICONS.edit} className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="মুছুন"
                      className="w-9 h-9 shrink-0 rounded-xl bg-[#fff1ef] text-[#b43a32] grid place-items-center"
                      onClick={() => del(p)}
                    >
                      <Icon d={ICONS.trash} className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
