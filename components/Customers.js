'use client'
import { useMemo, useState } from 'react'
import { api } from '@/lib/client'
import { summarize, kgFmt } from '@/lib/calc'
import { money } from '@/lib/bn'
import { Icon, ICONS, Field, Metric, Empty } from './ui'

export default function Customers({
  customers,
  txs,
  selected,
  setSelected,
  reload,
  toast,
}) {
  const [q, setQ] = useState('')
  const [form, setForm] = useState(null) // {id?, code, name, address}
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(null) // khola invoice er key
  const list = useMemo(
    () =>
      customers.filter((c) =>
        (c.name + ' ' + c.code).toLowerCase().includes(q.trim().toLowerCase()),
      ),
    [customers, q],
  )
  const c = customers.find((x) => x._id === selected)

  async function saveForm(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const body = { code: form.code, name: form.name, address: form.address }
      if (form.id)
        await api(`/api/customers/${form.id}`, { method: 'PUT', body })
      else {
        const n = await api('/api/customers', { method: 'POST', body })
        setSelected(n._id)
      }
      toast('কাস্টমার সংরক্ষিত')
      setForm(null)
      await reload()
    } catch (err) {
      toast(err.message, true)
    } finally {
      setBusy(false)
    }
  }
  const FormCard = form && (
    <form onSubmit={saveForm} className="card space-y-3 mb-4">
      <h2 className="font-extrabold">
        {form.id ? 'কাস্টমার সম্পাদনা' : 'নতুন কাস্টমার'}
      </h2>
      <div className="grid grid-cols-[110px_1fr] gap-3">
        <Field label="Code">
          <input
            className="inp"
            inputMode="numeric"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
        </Field>
        <Field label="নাম *">
          <input
            className="inp"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
      </div>
      <Field label="এলাকা / ঠিকানা">
        <input
          className="inp"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setForm(null)}
        >
          বাতিল
        </button>
        <button className="btn-primary" disabled={busy}>
          সংরক্ষণ
        </button>
      </div>
    </form>
  )

  if (c) {
    const ct = txs.filter((t) => t.customer === c._id),
      S = summarize(ct)
    const invoice = async () => {
      try {
        setBusy(true)
        const { downloadInvoice } = await import('@/lib/invoicePdf')
        await downloadInvoice(c, ct)
        toast('Invoice PDF ডাউনলোড হয়েছে')
      } catch (err) {
        console.error(err)
        toast('Invoice তৈরি করা যায়নি', true)
      } finally {
        setBusy(false)
      }
    }
    // Ek invoice / deposit = ek ta entry (batchId diye group)
    const groups = []
    const gmap = new Map()
    for (const t of ct) {
      const k = t.batchId || t._id
      let g = gmap.get(k)
      if (!g) {
        g = { key: k, ...t, total: 0, lines: [] }
        gmap.set(k, g)
        groups.push(g)
      }
      g.total += +t.amount || 0
      g.lines.push(t)
    }
    const del = async (g) => {
      const n = g.lines.length
      if (!confirm(n > 1 ? `এই invoice এর ${n}টি আইটেমসহ মুছে ফেলবেন?` : 'এই লেনদেন মুছে ফেলবেন?')) return
      try {
        for (const l of g.lines) await api(`/api/transactions/${l._id}`, { method: 'DELETE' })
        await reload()
        toast('মুছে ফেলা হয়েছে')
      } catch (e) {
        toast(e.message, true)
      }
    }
    const delCustomer = async () => {
      if (!confirm(`${c.name} কে মুছে ফেলবেন?`)) return
      try {
        await api(`/api/customers/${c._id}`, { method: 'DELETE' })
        setSelected(null)
        await reload()
        toast('কাস্টমার মুছে ফেলা হয়েছে')
      } catch (e) {
        toast(e.message, true)
      }
    }
    return (
      <div className="space-y-4">
        <button
          onClick={() => {
            setSelected(null)
            setForm(null)
          }}
          className="flex items-center gap-1 text-sm font-bold text-brand min-h-[40px]"
        >
          <Icon d={ICONS.back} className="w-5 h-5" />
          সব কাস্টমার
        </button>
        {FormCard}
        <div className="card">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-extrabold text-lg leading-tight">{c.name}</h2>
              <p className="text-xs text-slate-500 mt-1">
                কোড: {c.code || '—'} · {c.address || 'এলাকা নেই'}
              </p>
            </div>
            <button
              className="btn-soft !min-h-[40px] !px-3 shrink-0"
              onClick={() =>
                setForm({
                  id: c._id,
                  code: c.code,
                  name: c.name,
                  address: c.address,
                })
              }
            >
              <Icon d={ICONS.edit} className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={invoice}
            disabled={busy || !ct.length}
            className="btn-primary w-full mt-4"
          >
            <Icon d={ICONS.down} className="w-5 h-5" />
            {busy ? 'তৈরি হচ্ছে…' : 'Invoice PDF ডাউনলোড'}
          </button>
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            <Metric label="Sales" value={money(S.sales)} />
            <Metric label="Collection / MRR" value={money(S.col)} />
            <Metric
              label="Outstanding"
              value={money(S.out)}
              tone={S.out > 0 ? 'text-[#b43a32]' : undefined}
            />
            <Metric label="লেনদেন" value={S.count} />
          </div>
        </div>
        <div className="card">
          <h3 className="font-extrabold mb-2">Portfolio অনুযায়ী</h3>
          <div className="grid grid-cols-[1.1fr_1fr_1fr_1fr_1fr] gap-1 text-[10px] font-bold text-slate-500 bg-[#f7faf8] rounded-lg px-2 py-2">
            <span>Portfolio</span>
            <span className="text-right">Placement</span>
            <span className="text-right">Sales</span>
            <span className="text-right">Coll.</span>
            <span className="text-right">Due</span>
          </div>
          {S.rows.map((x) => (
            <div
              key={x.p}
              className="grid grid-cols-[1.1fr_1fr_1fr_1fr_1fr] gap-1 text-[11px] px-2 py-2 border-b border-[#edf1ef] last:border-0 tabular-nums"
            >
              <span className="font-semibold">{x.p}</span>
              <span className="text-right">{kgFmt(x.kg)}</span>
              <span className="text-right">{x.s.toLocaleString('en-BD')}</span>
              <span className="text-right">{x.c.toLocaleString('en-BD')}</span>
              <span className="text-right font-bold">
                {x.o.toLocaleString('en-BD')}
              </span>
            </div>
          ))}
        </div>
        <div className="card">
          <h3 className="font-extrabold mb-1">লেনদেনের তালিকা</h3>
          {groups.length === 0 && <Empty>এই কাস্টমারের কোনো লেনদেন নেই</Empty>}
          {groups.map((g) => {
            const isOpen = open === g.key
            const ports = [...new Set(g.lines.map((l) => l.portfolio))].join(', ')
            return (
              <div
                key={g.key}
                className="border-b border-[#edf1ef] last:border-0"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : g.key)}
                  className="w-full grid grid-cols-[minmax(0,1fr)_auto_14px] items-center gap-3 py-3 text-left"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-[13px] flex items-center gap-2 flex-wrap">
                      {g.type === 'MRR' ? (
                        <span className="chip bg-[#fdecea] text-[#d32f2f]">
                          MRR
                        </span>
                      ) : (
                        <span>{g.type}</span>
                      )}
                      {g.invoice && <span>Invoice {g.invoice}</span>}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {g.date} · {ports}
                      {g.lines.length > 1 ? ` · ${g.lines.length}টি আইটেম` : ''}
                      {g.bank ? ' · ' + g.bank + '/' + g.branch : ''}
                    </div>
                  </div>
                  <b
                    className={`text-sm tabular-nums text-right whitespace-nowrap ${g.type === 'MRR' ? 'text-[#d32f2f]' : ''}`}
                  >
                    {money(g.total)}
                  </b>
                  <span className="text-slate-400 text-[10px] text-center">
                    {isOpen ? '▲' : '▼'}
                  </span>
                </button>
                {isOpen && (
                  <div className="mb-3 rounded-xl bg-[#f7faf8] p-3 space-y-2 text-[12px]">
                    <div className="text-slate-500">
                      তারিখ: {g.date}
                      {g.invoice ? ' · Invoice: ' + g.invoice : ''}
                      {g.notes ? ' · ' + g.notes : ''}
                    </div>
                    {g.lines.map((l) => (
                      <div
                        key={l._id}
                        className="flex justify-between gap-2 border-t border-[#e3ebe7] pt-2"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold">
                            {l.portfolio}
                            {l.variety ? ' · ' + l.variety : ''}
                          </div>
                          <div className="text-slate-500">
                            {[l.grade, l.seedClass, l.pack]
                              .filter(Boolean)
                              .join(' · ')}
                            {l.kg ? ` ${l.kg} kg × ${l.rate}` : ''}
                          </div>
                        </div>
                        <b
                          className={`tabular-nums shrink-0 ${g.type === 'MRR' ? 'text-[#d32f2f]' : ''}`}
                        >
                          {money(l.amount)}
                        </b>
                      </div>
                    ))}
                    <div className="flex justify-between items-center border-t border-[#cfdcd6] pt-2 font-extrabold text-[13px]">
                      <span>মোট</span>
                      <span
                        className={`tabular-nums ${g.type === 'MRR' ? 'text-[#d32f2f]' : ''}`}
                      >
                        {money(g.total)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => del(g)}
                      className="w-full h-9 flex items-center justify-center gap-1 rounded-lg bg-[#fff1ef] text-[#b43a32] font-bold"
                    >
                      <Icon d={ICONS.trash} className="w-4 h-4" /> মুছুন
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <button onClick={delCustomer} className="btn-danger w-full">
          কাস্টমার মুছুন
        </button>
      </div>
    )
  }
  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          className="inp"
          placeholder="নাম বা কোড খুঁজুন"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          className="btn-primary shrink-0 !px-4"
          onClick={() => setForm({ code: '', name: '', address: '' })}
        >
          <Icon d={ICONS.plus} className="w-5 h-5" />
        </button>
      </div>
      {FormCard}
      <div className="card !p-0 overflow-hidden">
        {list.length === 0 && <Empty>কোনো কাস্টমার পাওয়া যায়নি</Empty>}
        {list.map((x) => {
          const s = summarize(txs.filter((t) => t.customer === x._id))
          return (
            <button
              key={x._id}
              onClick={() => setSelected(x._id)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 border-b border-[#edf1ef] last:border-0 text-left active:bg-brand-soft"
            >
              <div className="min-w-0">
                <div className="font-bold text-sm truncate">{x.name}</div>
                <div className="text-[11px] text-slate-500 truncate">
                  {x.code || 'কোড নেই'}
                  {x.address ? ' · ' + x.address : ''}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] text-slate-500">Outstanding</div>
                <b
                  className={`text-sm tabular-nums ${s.out > 0 ? 'text-[#b43a32]' : 'text-brand'}`}
                >
                  {money(s.out)}
                </b>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
