'use client'
import { useCallback, useEffect, useState } from 'react'
import { api, saveBlob } from '@/lib/client'
import { bn, taka, BN_MONTHS } from '@/lib/bn'
import { EXPENSE_CATEGORIES } from '@/lib/defaults'
import { Icon, ICONS, Field, Empty, Seg } from './ui'

const START = 'হাটিকুমরুল ডিপো অফিস'
const thisMonth = () => new Date().toLocaleDateString('en-CA').slice(0, 7)
// "14:05" <-> "02:05 PM"
const to12 = (v) => {
  if (!v) return ''
  const [h, m] = v.split(':').map(Number)
  return `${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}
const to24 = (v) => {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(v || '')
  if (!m) return ''
  let h = +m[1] % 12
  if (m[3].toUpperCase() === 'PM') h += 12
  return `${String(h).padStart(2, '0')}:${m[2]}`
}
const blank = (month) => ({
  date: `${month}-${String(Math.min(new Date().getDate(), 28)).padStart(2, '0')}`,
  start: '09:00',
  end: '',
  endPlace: '',
  startOdo: '',
  usedKm: '',
  allowance: '0',
  travelExpense: '0',
  voucher: '',
  activity: '',
})

export default function Tada({ toast }) {
  const [month, setMonth] = useState(thisMonth())
  const [data, setData] = useState({ entries: [], carryOdo: null })
  const [f, setF] = useState(blank(thisMonth()))
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const [view, setView] = useState('daily')
  const [exp, setExp] = useState({})
  const [saved, setSaved] = useState({ expenses: {}, monthComment: '' })
  const [comment, setComment] = useState('')
  const [editKey, setEditKey] = useState(null)
  const [draft, setDraft] = useState({})
  const setE = (key, field, v) =>
    setExp((p) => ({ ...p, [key]: { ...p[key], [field]: v } }))
  const loadExp = useCallback(
    async (m) => {
      try {
        const d = await api(`/api/tada/expenses?month=${m}`)
        setExp(d.expenses)
        setComment(d.monthComment)
        setSaved(d)
        setEditKey(null)
      } catch (e) {
        toast(e.message, true)
      }
    },
    [toast],
  )
  async function putExp(expenses, monthComment, msg = 'মাসিক খরচ সংরক্ষিত') {
    setBusy(true)
    try {
      const d = await api('/api/tada/expenses', {
        method: 'PUT',
        body: { month, expenses, monthComment },
      })
      setExp(d.expenses)
      setComment(d.monthComment)
      setSaved(d)
      toast(msg)
      return true
    } catch (e) {
      toast(e.message, true)
      return false
    } finally {
      setBusy(false)
    }
  }
  const saveExp = () => putExp(exp, comment)
  const startEdit = (c) => {
    const v = saved.expenses[c.key] || {}
    setDraft({
      label: v.label ?? c.label,
      amount: String(v.amount || ''),
      voucher: v.voucher || '',
      remark: v.remark || '',
    })
    setEditKey(c.key)
  }
  const saveDraft = async () => {
    if (
      await putExp(
        { ...saved.expenses, [editKey]: { ...draft } },
        saved.monthComment,
        'পরিবর্তন সংরক্ষিত',
      )
    )
      setEditKey(null)
  }
  const delExp = async (c) => {
    if (!confirm('এই খরচ মুছে ফেলবেন?')) return
    await putExp(
      {
        ...saved.expenses,
        [c.key]: { label: c.label, amount: 0, voucher: '', remark: '' },
      },
      saved.monthComment,
      'মুছে ফেলা হয়েছে',
    )
  }
  const monthInvoice = async () => {
    try {
      setBusy(true)
      const { downloadTadaInvoice } = await import('@/lib/tadaInvoicePdf')
      await downloadTadaInvoice(month, data.entries, saved)
      toast('Invoice PDF ডাউনলোড হয়েছে')
    } catch (e) {
      console.error(e)
      toast('Invoice তৈরি করা যায়নি', true)
    } finally {
      setBusy(false)
    }
  }
  const savedRows = EXPENSE_CATEGORIES.map((c) => ({
    c,
    v: saved.expenses[c.key] || {},
  })).filter((x) => +x.v.amount > 0)
  const savedTotal = savedRows.reduce((a, x) => a + +x.v.amount, 0)
  const [yy, mm] = month.split('-').map(Number)
  const dailyFood = data.entries.reduce((a, e) => a + e.allowance, 0),
    dailyTravel = data.entries.reduce((a, e) => a + e.travelExpense, 0)
  const load = useCallback(
    async (m) => {
      try {
        setData(await api(`/api/tada?month=${m}`))
      } catch (e) {
        toast(e.message, true)
      }
    },
    [toast],
  )
  useEffect(() => {
    load(month)
    loadExp(month)
    setF(blank(month))
    setEditing(false)
  }, [month, load, loadExp])

  const prior = [...data.entries].filter((e) => e.date < f.date).pop()
  const startOdo = prior
    ? prior.endOdo
    : data.entries.length === 0 || f.date < data.entries[0]?.date
      ? (data.carryOdo ?? '')
      : f.startOdo
  const locked = !!prior || (data.carryOdo != null && !data.entries.length)
  const used = Number(f.usedKm) || 0,
    endOdo = startOdo !== '' ? Number(startOdo) + used : ''
  const totalKm = data.entries.reduce((a, e) => a + e.usedKm, 0),
    totalAmt =
      data.entries.reduce((a, e) => a + e.allowance + e.travelExpense, 0) +
      EXPENSE_CATEGORIES.reduce((a, c) => a + (+exp[c.key]?.amount || 0), 0)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const d = await api('/api/tada', {
        method: 'POST',
        body: {
          month,
          date: f.date,
          startTime: to12(f.start),
          endTime: to12(f.end),
          endPlace: f.endPlace,
          startOdo: startOdo === '' ? f.startOdo : startOdo,
          usedKm: f.usedKm,
          allowance: f.allowance,
          travelExpense: f.travelExpense,
          voucher: f.voucher,
          activity: f.activity,
        },
      })
      setData(d)
      toast(editing ? 'পরিবর্তন সংরক্ষিত' : 'তথ্য সংরক্ষিত')
      setF(blank(month))
      setEditing(false)
    } catch (err) {
      toast(err.message, true)
    } finally {
      setBusy(false)
    }
  }
  const edit = (e) => {
    setF({
      date: e.date,
      start: to24(e.startTime),
      end: to24(e.endTime),
      endPlace: e.endPlace,
      startOdo: String(e.startOdo),
      usedKm: String(e.usedKm),
      allowance: String(e.allowance),
      travelExpense: String(e.travelExpense),
      voucher: e.voucher,
      activity: e.activity,
    })
    setEditing(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const del = async (e) => {
    if (!confirm('এই ভ্রমণ রেকর্ড মুছবেন?')) return
    try {
      setData(
        await api(`/api/tada?month=${month}&date=${e.date}`, {
          method: 'DELETE',
        }),
      )
      toast('মুছে ফেলা হয়েছে')
    } catch (er) {
      toast(er.message, true)
    }
  }
  const excel = async () => {
    setBusy(true)
    try {
      const r = await fetch(`/api/tada/export?month=${month}`)
      if (!r.ok) throw new Error((await r.json()).error)
      saveBlob(await r.blob(), `Copy-of-Tada-${month}.xlsx`)
      toast('TA/DA Excel ডাউনলোড হয়েছে')
    } catch (e) {
      toast(e.message || 'Excel তৈরি হয়নি', true)
    } finally {
      setBusy(false)
    }
  }
  const gps = () => {
    if (!navigator.geolocation) return toast('GPS পাওয়া যাচ্ছে না', true)
    toast('লোকেশন খুঁজছি…')
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: la, longitude: lo } }) => {
        let s = `GPS ${la.toFixed(5)}, ${lo.toFixed(5)}`
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${la}&lon=${lo}&zoom=16`,
          )
          if (r.ok) {
            const j = await r.json()
            s =
              j.name ||
              j.address?.village ||
              j.address?.town ||
              j.address?.road ||
              s
          }
        } catch {}
        set('endPlace', s)
        toast('প্রয়োজনে নামটি সম্পাদনা করুন')
      },
      () => toast('GPS অনুমতি/সংযোগ নেই', true),
      { enableHighAccuracy: true, timeout: 12000 },
    )
  }
  const places = [...new Set(data.entries.map((e) => e.endPlace))].slice(0, 12)

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-end justify-between gap-3">
          <Field label="রিপোর্ট মাস" className="flex-1">
            <input
              className="inp"
              type="month"
              value={month}
              onChange={(e) => e.target.value && setMonth(e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          {[
            ['ভ্রমণ', bn(data.entries.length)],
            ['মোট কিমি', bn(totalKm.toLocaleString('en-US'))],
            ['মোট খরচ', taka(totalAmt)],
          ].map(([l, v]) => (
            <div key={l} className="bg-brand-soft rounded-xl py-2.5">
              <b className="block text-brand tabular-nums">{v}</b>
              <span className="text-[11px] text-slate-600">{l}</span>
            </div>
          ))}
        </div>
        <button
          onClick={excel}
          disabled={busy || !data.entries.length}
          className="btn-primary w-full mt-3"
        >
          <Icon d={ICONS.down} className="w-5 h-5" />
          TA/DA Excel ডাউনলোড
        </button>
      </div>

      <Seg
        value={view}
        onChange={setView}
        options={[
          ['daily', '✍️ দৈনিক তথ্য'],
          ['monthly', '🧾 মাসিক খরচ'],
        ]}
      />

      {view === 'monthly' && (
        <>
          <div className="card space-y-4">
            <div>
              <h2 className="font-extrabold text-lg">মাসিক অন্যান্য খরচ</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                এই খরচগুলো মূল summary Excel-এর একই খাতে বসবে
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {EXPENSE_CATEGORIES.map((c) => {
                const v = exp[c.key] || {}
                return (
                  <div
                    key={c.key}
                    className="rounded-2xl border border-[#dce6e2] p-3 space-y-2.5"
                  >
                    {c.custom ? (
                      <Field label={`${c.label} · নাম`}>
                        <input
                          className="inp"
                          value={v.label ?? c.label}
                          onChange={(e) => setE(c.key, 'label', e.target.value)}
                        />
                      </Field>
                    ) : (
                      <strong className="block text-[15px]">{c.label}</strong>
                    )}
                    <Field label="টাকা (৳)">
                      <input
                        className="inp"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={v.amount ?? ''}
                        placeholder="0"
                        onChange={(e) => setE(c.key, 'amount', e.target.value)}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-2.5">
                      <Field label="ভাউচার নম্বর">
                        <input
                          className="inp"
                          value={v.voucher || ''}
                          onChange={(e) =>
                            setE(c.key, 'voucher', e.target.value)
                          }
                        />
                      </Field>
                      <Field label="মন্তব্য">
                        <input
                          className="inp"
                          value={v.remark || ''}
                          onChange={(e) =>
                            setE(c.key, 'remark', e.target.value)
                          }
                        />
                      </Field>
                    </div>
                  </div>
                )
              })}
            </div>
            <Field label="মাসিক মন্তব্য (ঐচ্ছিক)">
              <textarea
                className="inp min-h-[80px]"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="সংক্ষিপ্ত মন্তব্য"
              />
            </Field>
            <button
              type="button"
              onClick={saveExp}
              disabled={busy}
              className="btn-primary w-full"
            >
              {busy ? 'সংরক্ষণ হচ্ছে…' : 'মাসিক খরচ সংরক্ষণ'}
            </button>
            <p className="text-[11px] leading-relaxed bg-[#fdf6ea] border border-[#f1dcb5] rounded-xl p-3 text-[#7a5a1e]">
              দৈনিক খাদ্যভাতা ও ভ্রমণ খরচ দৈনিক ফর্ম থেকে মোট খরচে যোগ হবে।
              জ্বালানির টাকা অটো পূরণ হবে না।
            </p>
          </div>

          <div className="card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-extrabold">
                  {BN_MONTHS[mm - 1]} {bn(yy)} — মাসিক খরচের তালিকা
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  সংরক্ষিত খরচ এখানে দেখাবে
                </p>
              </div>
            </div>
            {savedRows.length === 0 && (
              <Empty>এই মাসে কোনো মাসিক খরচ সংরক্ষিত নেই</Empty>
            )}
            {/* {savedRows.map(({ c, v }) => editKey === c.key ? (
            <div key={c.key} className="py-3 border-b border-[#edf1ef] space-y-2.5">
              <strong className="text-sm">{c.label}</strong>
              {c.custom && <Field label="খাতের নাম"><input className="inp" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} /></Field>}
              <div className="grid grid-cols-3 gap-2"><Field label="টাকা"><input className="inp" type="number" inputMode="numeric" min="0" value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: e.target.value })} /></Field><Field label="ভাউচার"><input className="inp" value={draft.voucher} onChange={(e) => setDraft({ ...draft, voucher: e.target.value })} /></Field><Field label="মন্তব্য"><input className="inp" value={draft.remark} onChange={(e) => setDraft({ ...draft, remark: e.target.value })} /></Field></div>
              <div className="grid grid-cols-2 gap-2"><button className="btn-ghost" onClick={() => setEditKey(null)}>বাতিল</button><button className="btn-primary" disabled={busy} onClick={saveDraft}>সংরক্ষণ</button></div>
            </div>
          ) : (
            <div key={c.key} className="flex items-center justify-between gap-2 py-3 border-b border-[#edf1ef] last:border-0">
              <div className="min-w-0"><div className="font-bold text-sm truncate">{c.custom ? v.label || c.label : c.label}</div><div className="text-[11px] text-slate-500 truncate">৳{v.amount}{v.voucher ? ' · ভাউচার ' + v.voucher : ''}{v.remark ? ' · ' + v.remark : ''}</div></div>
              <div className="flex gap-1.5 shrink-0">
                <button aria-label="সম্পাদনা" onClick={() => startEdit(c)} className="w-10 h-10 grid place-items-center rounded-lg bg-brand-soft text-brand"><Icon d={ICONS.edit} className="w-4 h-4" /></button>
                <button aria-label="মুছুন" onClick={() => delExp(c)} className="w-10 h-10 grid place-items-center rounded-lg bg-[#fff1ef] text-[#b43a32]"><Icon d={ICONS.trash} className="w-4 h-4" /></button>
              </div>
            </div>
          ))} */}
            <div className="mt-3 rounded-xl bg-[#f2faf6] p-3 text-[13px] space-y-1.5">
              <div className="flex justify-between">
                <span>মাসিক অন্যান্য খরচ</span>
                <b className="tabular-nums">{taka(savedTotal)}</b>
              </div>
              <div className="flex justify-between">
                <span>ভ্রমণ ({bn(data.entries.length)}টি): খাদ্য/হোটেল</span>
                <b className="tabular-nums">{taka(dailyFood)}</b>
              </div>
              <div className="flex justify-between">
                <span>যানবাহন/ভ্রমণ খরচ</span>
                <b className="tabular-nums">{taka(dailyTravel)}</b>
              </div>
              <div className="flex justify-between border-t border-[#a8d4c2] pt-2 text-brand text-[15px]">
                <b>সর্বমোট</b>
                <b className="tabular-nums">
                  {taka(savedTotal + dailyFood + dailyTravel)}
                </b>
              </div>
            </div>
            <button
              onClick={monthInvoice}
              disabled={busy || (!data.entries.length && !savedRows.length)}
              className="btn-primary w-full mt-3"
            >
              <Icon d={ICONS.down} className="w-5 h-5" />
              মাসের Invoice PDF ডাউনলোড
            </button>
            <p className="text-[11px] text-slate-500 mt-2">
              Invoice-এ পুরো মাসের ভ্রমণ তথ্য ও মাসিক খরচের তালিকা একসাথে থাকবে।
            </p>
          </div>
        </>
      )}

      {view === 'daily' && (
        <>
          <form onSubmit={submit} className="card space-y-4">
            <h2 className="font-extrabold text-lg">
              {editing ? 'ভ্রমণ তথ্য সম্পাদনা' : 'দৈনিক ভ্রমণ যোগ করুন'}
            </h2>
            <Field label="ভ্রমণের তারিখ *">
              <input
                className="inp"
                type="date"
                required
                value={f.date}
                onChange={(e) => {
                  if (e.target.value && !e.target.value.startsWith(month))
                    setMonth(e.target.value.slice(0, 7))
                  set('date', e.target.value)
                }}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="শুরুর সময়">
                <input
                  className="inp"
                  type="time"
                  value={f.start}
                  onChange={(e) => set('start', e.target.value)}
                />
              </Field>
              <Field label="শেষের সময়">
                <input
                  className="inp"
                  type="time"
                  value={f.end}
                  onChange={(e) => set('end', e.target.value)}
                />
              </Field>
            </div>
            <div className="text-xs bg-[#f2faf6] border border-dashed border-[#a8d4c2] rounded-xl px-3 py-2.5">
              শুরুর স্থান: <b>{START}</b>
            </div>
            <Field
              label="শেষের স্থান *"
              note="GPS বাটনে প্রস্তাব আসবে; নাম সম্পাদনা করতে পারবেন।"
            >
              <div className="flex gap-2">
                <input
                  className="inp"
                  list="places"
                  required
                  value={f.endPlace}
                  onChange={(e) => set('endPlace', e.target.value)}
                  placeholder="স্থান লিখুন"
                />
                <button
                  type="button"
                  onClick={gps}
                  className="btn-soft shrink-0 !px-3"
                >
                  <Icon d={ICONS.pin} className="w-5 h-5" />
                  GPS
                </button>
              </div>
              <datalist id="places">
                {places.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="প্রারম্ভিক মিটার *"
                note={
                  locked
                    ? 'আগের সমাপনী মিটার থেকে এসেছে'
                    : 'প্রথম এন্ট্রির মিটার লিখুন'
                }
              >
                <input
                  className="inp"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  required
                  readOnly={locked}
                  value={locked ? startOdo : f.startOdo}
                  onChange={(e) => set('startOdo', e.target.value)}
                />
              </Field>
              <Field label="আজ ব্যবহৃত কিমি *">
                <input
                  className="inp"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  required
                  value={f.usedKm}
                  onChange={(e) => set('usedKm', e.target.value)}
                  placeholder="যেমন: ৪৫"
                />
              </Field>
              <Field label="সমাপনী মিটার (অটো)" className="col-span-2">
                <input
                  className="inp"
                  readOnly
                  value={
                    endOdo === '' ? '' : bn(endOdo.toLocaleString('en-US'))
                  }
                />
              </Field>
              <Field label="খাদ্য/হোটেল ভাতা (৳)">
                <input
                  className="inp"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={f.allowance}
                  onChange={(e) => set('allowance', e.target.value)}
                />
              </Field>
              <Field label="যানবাহন/ভ্রমণ খরচ (৳)">
                <input
                  className="inp"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={f.travelExpense}
                  onChange={(e) => set('travelExpense', e.target.value)}
                />
              </Field>
            </div>
            <details className="rounded-xl border border-[#dce6e2] px-3 py-2.5">
              <summary className="text-sm font-bold text-brand cursor-pointer min-h-[32px] flex items-center">
                ঐচ্ছিক: ভাউচার ও মন্তব্য
              </summary>
              <div className="space-y-3 mt-3">
                <Field label="ভাউচার নম্বর">
                  <input
                    className="inp"
                    value={f.voucher}
                    onChange={(e) => set('voucher', e.target.value)}
                    placeholder="যেমন: ১, ২-৩"
                  />
                </Field>
                <Field label="কাজের ফলাফল / মন্তব্য">
                  <textarea
                    className="inp min-h-[80px]"
                    value={f.activity}
                    onChange={(e) => set('activity', e.target.value)}
                    placeholder="যেমন: কাস্টমার ভিজিট"
                  />
                </Field>
              </div>
            </details>
            <div className="grid grid-cols-2 gap-3">
              {editing ? (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setF(blank(month))
                    setEditing(false)
                  }}
                >
                  বাতিল
                </button>
              ) : (
                <span />
              )}
              <button
                className={`btn-primary ${editing ? '' : 'col-span-2'}`}
                disabled={busy}
              >
                {editing ? 'পরিবর্তন সংরক্ষণ' : 'তথ্য সংরক্ষণ'}
              </button>
            </div>
          </form>

          <div className="card">
            <h2 className="font-extrabold mb-1">এই মাসের ভ্রমণ</h2>
            {data.entries.length === 0 && (
              <Empty>এখনও কোনো ভ্রমণ যোগ হয়নি</Empty>
            )}
            {[...data.entries].reverse().map((e) => (
              <div
                key={e.date}
                className="flex items-center justify-between gap-2 py-3 border-b border-[#edf1ef] last:border-0"
              >
                <div className="min-w-0">
                  <div className="font-bold text-sm truncate">
                    {e.date.slice(8)}/{e.date.slice(5, 7)} · {e.endPlace}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {e.startTime || '—'}–{e.endTime || '—'} · {e.usedKm} কিমি ·
                    ভাতা ৳{e.allowance} · খরচ ৳{e.travelExpense}
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    aria-label="সম্পাদনা"
                    onClick={() => edit(e)}
                    className="w-10 h-10 grid place-items-center rounded-lg bg-brand-soft text-brand"
                  >
                    <Icon d={ICONS.edit} className="w-4 h-4" />
                  </button>
                  <button
                    aria-label="মুছুন"
                    onClick={() => del(e)}
                    className="w-10 h-10 grid place-items-center rounded-lg bg-[#fff1ef] text-[#b43a32]"
                  >
                    <Icon d={ICONS.trash} className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
