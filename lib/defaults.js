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
