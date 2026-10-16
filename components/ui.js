'use client';
export const Icon = ({ d, className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}><path d={d} /></svg>
);
export const ICONS = {
  home: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
  plus: 'M12 5v14M5 12h14',
  users: 'M16 19v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1M9.5 10a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM21 19v-1a4 4 0 00-3-3.9M16 3.1a3.5 3.5 0 010 6.8',
  route: 'M6 19a2 2 0 100-4 2 2 0 000 4zM18 9a2 2 0 100-4 2 2 0 000 4zM8 17h7a3 3 0 000-6H9a3 3 0 010-6h7',
  down: 'M12 3v12m0 0l-4-4m4 4l4-4M4 20h16',
  back: 'M15 18l-6-6 6-6',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  edit: 'M4 20h4L19 9l-4-4L4 16v4z',
  pin: 'M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11zM12 12a2 2 0 100-4 2 2 0 000 4z',
};
export const Field = ({ label, children, className = '', note }) => (
  <div className={`min-w-0 ${className}`}>{label && <label className="lbl">{label}</label>}{children}{note && <p className="text-[11px] text-slate-500 mt-1">{note}</p>}</div>
);
export const Seg = ({ value, onChange, options, cols }) => (
  <div className={`grid gap-1.5 bg-[#e8efec] p-1 rounded-2xl`} style={{ gridTemplateColumns: `repeat(${cols || options.length},1fr)` }}>
    {options.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return (
      <button type="button" key={v} onClick={() => onChange(v)} className={`min-h-[42px] rounded-xl text-[13px] font-bold px-1 transition ${value === v ? 'bg-white text-brand shadow-sm' : 'text-[#53645f]'}`}>{l}</button>
    ); })}
  </div>
);
export const Metric = ({ label, value, tone }) => (
  <div className="metric"><span className="block text-[11px] text-slate-500">{label}</span><strong className={`block mt-1 text-lg tabular-nums ${tone || 'text-brand'}`}>{value}</strong></div>
);
export const Empty = ({ children }) => <div className="py-8 text-center text-sm text-slate-500">{children}</div>;
