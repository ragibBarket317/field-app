import './globals.css';

export const metadata = { title: 'Field Manager', description: 'Sales, Collection ও TA/DA — ব্যক্তিগত মোবাইল অ্যাপ' };
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#113b36' };

export default function RootLayout({ children }) {
  return (<html lang="bn"><body>{children}</body></html>);
}
