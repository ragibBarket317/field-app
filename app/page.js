'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/client';
import { Icon, ICONS } from '@/components/ui';
import Home from '@/components/Home';
import Entry from '@/components/Entry';
import Customers from '@/components/Customers';
import Tada from '@/components/Tada';

const TABS = [['home', 'হোম', ICONS.home], ['entry', 'এন্ট্রি', ICONS.plus], ['customers', 'কাস্টমার', ICONS.users], ['tada', 'TA/DA', ICONS.route]];
const TITLES = { home: 'Region Overview', entry: 'নতুন এন্ট্রি', customers: 'Customer Details', tada: 'TA/DA রিপোর্ট' };

export default function Page() {
  const [tab, setTab] = useState('home');
  const [customers, setCustomers] = useState([]);
  const [txs, setTxs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [state, setState] = useState('loading');
  const [msg, setMsg] = useState(null);
  const timer = useRef();

  const toast = useCallback((text, error = false) => { setMsg({ text, error }); clearTimeout(timer.current); timer.current = setTimeout(() => setMsg(null), 3000); }, []);
  const reload = useCallback(async () => {
    try { const [c, t] = await Promise.all([api('/api/customers'), api('/api/transactions')]); setCustomers(c); setTxs(t); setState('ok'); }
    catch (e) { setState(e.message); }
  }, []);
  useEffect(() => { reload(); }, [reload]);
  const go = (t) => { setTab(t); window.scrollTo({ top: 0 }); };
  const openCustomer = (id) => { setSelected(id); go('customers'); };

  return (
    <div className="min-h-screen pb-28">
      <header className="bg-gradient-to-br from-brand-dark to-brand text-white rounded-b-[26px] px-4 pb-5 pt-[calc(env(safe-area-inset-top)+18px)]">
        <div className="max-w-2xl mx-auto">
          <div className="text-[11px] tracking-widest opacity-80">HATIKUMRUL REGION · FIELD MANAGER</div>
          <h1 className="text-[22px] font-extrabold mt-1">{TITLES[tab]}</h1>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-3.5 pt-4">
        {state === 'loading' ? <div className="card text-center text-sm text-slate-500 py-10">লোড হচ্ছে…</div>
          : state !== 'ok' ? <div className="card text-sm"><b className="text-[#b43a32]">ডাটাবেস সংযোগ হয়নি</b><p className="text-slate-600 mt-1">{state}</p><button className="btn-primary w-full mt-3" onClick={() => { setState('loading'); reload(); }}>আবার চেষ্টা করুন</button></div>
          : <>
            {tab === 'home' && <Home customers={customers} txs={txs} openCustomer={openCustomer} toast={toast} />}
            {tab === 'entry' && <Entry customers={customers} txs={txs} reload={reload} toast={toast} />}
            {tab === 'customers' && <Customers customers={customers} txs={txs} selected={selected} setSelected={setSelected} reload={reload} toast={toast} />}
            {tab === 'tada' && <Tada toast={toast} />}
          </>}
      </main>
      {msg && <div role="status" className={`fixed left-1/2 -translate-x-1/2 bottom-[calc(env(safe-area-inset-bottom)+88px)] z-50 max-w-[90vw] rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${msg.error ? 'bg-[#b43a32]' : 'bg-[#113b36]'}`}>{msg.text}</div>}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-[#dce6e2] pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-2xl mx-auto grid grid-cols-4">
          {TABS.map(([k, l, d]) => (
            <button key={k} onClick={() => go(k)} className={`flex flex-col items-center gap-0.5 py-2.5 min-h-[60px] text-[11px] font-bold ${tab === k ? 'text-brand' : 'text-slate-400'}`}>
              <span className={`grid place-items-center w-12 h-7 rounded-full ${tab === k ? 'bg-brand-soft' : ''}`}><Icon d={d} className="w-[22px] h-[22px]" /></span>{l}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
