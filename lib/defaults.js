export const PORTFOLIOS = ['Hybrid Rice', 'Inbred Rice', 'Mustard', 'Maize', 'Potato'];
export const DEFAULT_CUSTOMERS = [
  ['1702','Moli Traders','Solonga, Sirajganj'],['1704','Sapla Beej Bhander','Solop, Ullapara, Sirajganj'],
  ['1705','Ratna Beej Bhander','Ullapara, Sirajganj'],['1706','Bondhu Traders','Mohonpur, Ullapara, Sirajganj'],
  ['1710','Zia Traders','Solonga, Sirajganj'],['1713','Mukta Agro Servise','Sayabgonj, Solonga, Sirajganj'],
  ['1715','Mamta Traders','Pachlia, Ullapara, Sirajganj'],['1717','Rakbib Enterprise','Ghurka, Solonga, Sirajganj'],
  ['1719','Abul & Masud Traders',''],['1720','Sumon Traders','Ullapara, Sirajganj'],['1721','Sarker Traders',''],
  ['1722','Sotota Traders','Tarash, Sirajganj'],['1724','Rina Traders',''],['1725','Anguri Tradrs',''],
].map(([code, name, address]) => ({ code, name, address }));
export const EXPENSE_CATEGORIES = [
  { key: 'maintenance', label: 'গাড়ি / মোটরসাইকেল রক্ষণাবেক্ষণ' }, { key: 'postal', label: 'ডাক ও কুরিয়ার' },
  { key: 'printing', label: 'প্রিন্টিং ও স্টেশনারি' }, { key: 'mobile', label: 'মোবাইল বিল' },
  { key: 'internet', label: 'ইন্টারনেট বিল' }, { key: 'bank', label: 'ব্যাংক / অনলাইন চার্জ' },
  { key: 'entertainment', label: 'আপ্যায়ন' }, { key: 'others', label: 'অন্যান্য' },
  { key: 'extra1', label: 'অতিরিক্ত খাত ১১', custom: true }, { key: 'extra2', label: 'অতিরিক্ত খাত ১২', custom: true },
];

// Seed Invoice Prices (Seed_Invoice_Prices.xlsx) — [portfolio, variety, seedClass, grade/pack, Tk per kg]
export const PRICE_LIST = [
  ["Inbred Rice", "BRRI dhan28", "Foundation Seed", "2 kg pack", 95],
  ["Inbred Rice", "BRRI dhan28", "Foundation Seed", "10 kg pack", 93],
  ["Inbred Rice", "BRRI dhan28", "Quality Declared (TLS)", "2 kg pack", 90],
  ["Inbred Rice", "BRRI dhan28", "Quality Declared (TLS)", "5 kg pack", 87],
  ["Inbred Rice", "BRRI dhan28", "Quality Declared (TLS)", "10 kg pack", 88],
  ["Inbred Rice", "BRRI dhan29", "Foundation Seed", "2 kg pack", 90],
  ["Inbred Rice", "BRRI dhan29", "Foundation Seed", "10 kg pack", 88],
  ["Inbred Rice", "BRRI dhan29", "Quality Declared (TLS)", "2 kg pack", 85],
  ["Inbred Rice", "BRRI dhan29", "Quality Declared (TLS)", "5 kg pack", 82],
  ["Inbred Rice", "BRRI dhan29", "Quality Declared (TLS)", "10 kg pack", 83],
  ["Inbred Rice", "BRRI dhan58", "Foundation Seed", "2 kg pack", 103],
  ["Inbred Rice", "BRRI dhan58", "Foundation Seed", "10 kg pack", 101],
  ["Inbred Rice", "BRRI dhan58", "Quality Declared (TLS)", "2 kg pack", 98],
  ["Inbred Rice", "BRRI dhan58", "Quality Declared (TLS)", "10 kg pack", 96],
  ["Inbred Rice", "BRRI dhan74", "Foundation Seed", "2 kg pack", 97],
  ["Inbred Rice", "BRRI dhan74", "Foundation Seed", "10 kg pack", 95],
  ["Inbred Rice", "BRRI dhan74", "Quality Declared (TLS)", "2 kg pack", 92],
  ["Inbred Rice", "BRRI dhan74", "Quality Declared (TLS)", "10 kg pack", 90],
  ["Inbred Rice", "BRRI dhan88", "Foundation Seed", "2 kg pack", 97],
  ["Inbred Rice", "BRRI dhan88", "Foundation Seed", "10 kg pack", 95],
  ["Inbred Rice", "BRRI dhan88", "Quality Declared (TLS)", "2 kg pack", 92],
  ["Inbred Rice", "BRRI dhan88", "Quality Declared (TLS)", "10 kg pack", 90],
  ["Inbred Rice", "BRRI dhan89", "Foundation Seed", "2 kg pack", 103],
  ["Inbred Rice", "BRRI dhan89", "Foundation Seed", "10 kg pack", 101],
  ["Inbred Rice", "BRRI dhan89", "Quality Declared (TLS)", "2 kg pack", 98],
  ["Inbred Rice", "BRRI dhan89", "Quality Declared (TLS)", "10 kg pack", 96],
  ["Inbred Rice", "BRRI dhan92", "Foundation Seed", "2 kg pack", 103],
  ["Inbred Rice", "BRRI dhan92", "Foundation Seed", "10 kg pack", 101],
  ["Inbred Rice", "BRRI dhan92", "Quality Declared (TLS)", "2 kg pack", 98],
  ["Inbred Rice", "BRRI dhan92", "Quality Declared (TLS)", "10 kg pack", 96],
  ["Inbred Rice", "BRRI dhan100", "Quality Declared (TLS)", "2 kg pack", 98],
  ["Inbred Rice", "BRRI dhan100", "Quality Declared (TLS)", "10 kg pack", 96],
  ["Inbred Rice", "BRRI dhan102", "Quality Declared (TLS)", "2 kg pack", 98],
  ["Inbred Rice", "BRRI dhan102", "Quality Declared (TLS)", "10 kg pack", 96],
  ["Inbred Rice", "BRRI dhan108", "Quality Declared (TLS)", "2 kg pack", 98],
  ["Inbred Rice", "BRRI dhan108", "Quality Declared (TLS)", "10 kg pack", 96],
  ["Inbred Rice", "Khato Jirashail", "Quality Declared (TLS)", "2 kg pack", 108],
  ["Inbred Rice", "Khato Jirashail", "Quality Declared (TLS)", "10 kg pack", 106],
  ["Hybrid Rice", "Hira-1", "Coarse grain", "1 kg pack", 375],
  ["Hybrid Rice", "Hira-2", "Coarse grain", "1 kg pack", 375],
  ["Hybrid Rice", "Hira-2", "Coarse grain", "5 kg pack (1825/5)", 365],
  ["Hybrid Rice", "Hira-6", "Coarse grain", "1 kg pack", 320],
  ["Hybrid Rice", "Hira-9", "Coarse grain", "1 kg pack", 325],
  ["Hybrid Rice", "Hira-15", "Fine grain", "1 kg pack", 480],
  ["Hybrid Rice", "Hira-19", "Fine grain", "1 kg pack", 450],
  ["Hybrid Rice", "Hira-21", "Fine grain", "1 kg pack", 420],
  ["Hybrid Rice", "Hira-27", "Fine grain", "1 kg pack", 360],
  ["Hybrid Rice", "Surabhi-1", "Fine grain", "1 kg pack", 360],
  ["Hybrid Rice", "Suborno-3", "Fine grain", "1 kg pack", 680],
  ["Hybrid Rice", "Suborno-5", "Fine grain", "1 kg pack", 550],
  ["Mustard", "Bari Sarisha-14", "", "1 kg pack", 250],
  ["Mustard", "Bari Sarisha-18", "", "1 kg pack", 250],
  ["Mustard", "Bari Sarisha-20", "", "1 kg pack", 235],
  ["Mustard", "Tori-7", "", "1 kg pack", 250],
  ["Potato", "Cardinal", "Foundation Seed", "Grade A", 45.6],
  ["Potato", "Cardinal", "Foundation Seed", "Grade B", 43.7],
  ["Potato", "Cardinal", "Certified / Quality Declared", "Grade A", 36.1],
  ["Potato", "Cardinal", "Certified / Quality Declared", "Grade B", 34.2],
  ["Potato", "Granola", "Foundation Seed", "Grade A", 42.75],
  ["Potato", "Granola", "Foundation Seed", "Grade B", 39.9],
  ["Potato", "Granola", "Certified / Quality Declared", "Grade A", 33.25],
  ["Potato", "Granola", "Certified / Quality Declared", "Grade B", 30.4],
  ["Potato", "Musica", "Foundation Seed", "Grade A", 50.35],
  ["Potato", "Musica", "Foundation Seed", "Grade B", 48.85],
  ["Potato", "Musica", "Certified / Quality Declared", "Grade A", 40.85],
  ["Potato", "Musica", "Certified / Quality Declared", "Grade B", 38.95],
  ["Potato", "Karez", "Foundation Seed", "Grade A", 39.9],
  ["Potato", "Karez", "Foundation Seed", "Grade B", 38],
  ["Potato", "Karez", "Certified / Quality Declared", "Grade A", 30.4],
  ["Potato", "Karez", "Certified / Quality Declared", "Grade B", 28.5],
  ["Potato", "Allute", "Foundation Seed", "Grade A", 39.9],
  ["Potato", "Allute", "Foundation Seed", "Grade B", 38],
  ["Potato", "Allute", "Certified / Quality Declared", "Grade A", 30.4],
  ["Potato", "Allute", "Certified / Quality Declared", "Grade B", 28.5],
  ["Potato", "Sunshine", "Foundation Seed", "Grade A", 47.5],
  ["Potato", "Sunshine", "Foundation Seed", "Grade B", 45.6],
  ["Potato", "Sunshine", "Certified / Quality Declared", "Grade A", 38],
  ["Potato", "Sunshine", "Certified / Quality Declared", "Grade B", 36.1],
  ["Potato", "Levante", "Foundation Seed", "Grade A", 45.6],
  ["Potato", "Levante", "Foundation Seed", "Grade B", 43.7],
];
// list = [[portfolio, variety, seedClass, pack, price], ...] (DB theke ashe; default PRICE_LIST)
const priceRows = (list, portfolio, variety) => list.filter((r) => r[0] === portfolio && r[1] === variety);
// Portfolio-r variety name list (dropdown)
export const varietiesOf = (list, portfolio) => [...new Set(list.filter((r) => r[0] === portfolio).map((r) => r[1]))];
// Variety-r jonno kon kon option (seed class / pack-grade) ache. seedClass dile shei class er pack gulo
export const optionsOf = (list, portfolio, variety, seedClass = '') => {
  const rows = priceRows(list, portfolio, variety);
  return { classes: [...new Set(rows.map((r) => r[2]).filter(Boolean))], packs: [...new Set(rows.filter((r) => !seedClass || !r[2] || r[2] === seedClass).map((r) => r[3]))] };
};
// Per kg price; na pele null (user nijer rate likhbe)
export const priceOf = (list, portfolio, variety, seedClass, pack) => {
  const hit = priceRows(list, portfolio, variety).find((r) => (!r[2] || !seedClass || r[2] === seedClass) && r[3] === pack);
  return hit ? hit[4] : null;
};
// "10 kg pack" / "5 kg pack (1825/5)" theke pack-er weight (kg). "Grade A" er moto hole 0 (pack nei)
export const packKg = (pack) => { const m = /(\d+(?:\.\d+)?)\s*kg/i.exec(pack || ''); return m ? +m[1] : 0; };
