# Field Manager (Next.js + Tailwind + MongoDB/Mongoose)

Sales/Collection + TA/DA — ব্যক্তিগত মোবাইল-ফার্স্ট অ্যাপ।

## চালানোর নিয়ম
1. `npm install`
2. `.env.local` এ `MONGODB_URI` দিন (লোকাল: `mongodb://127.0.0.1:27017/field-app`, বা MongoDB Atlas URI)
3. `npm run dev` → http://localhost:3000 (ফোনে একই Wi-Fi থেকে `http://<PC-IP>:3000`)
4. প্রোডাকশন: `npm run build && npm start`

## ফিচার
- হোম: Region overview, portfolio হিসাব, কাস্টমারভিত্তিক outstanding, CSV export
- এন্ট্রি: Sales / MRR / Bank Payment
- কাস্টমার: তালিকা, বিস্তারিত, কোড/নাম সম্পাদনা, **Invoice PDF** (`<CustomerName>_invoice.pdf`)
- TA/DA: মাসভিত্তিক দৈনিক ভ্রমণ, মিটার অটো-চেইন, **Excel ডাউনলোড** (`templates/tada-template.xlsx` এর ফরম্যাট হুবহু ঠিক থাকে)

## Excel টেমপ্লেট বদলাতে
`templates/tada-template.xlsx` ফাইলটি প্রতিস্থাপন করুন (৩ শিট, একই সেল লে-আউট)।
