# FLOW Petroleum Operations MVP

FLOW Petroleum station management ka premium responsive MVP. UI FLOW logo ke navy, royal blue aur amber theme mein hai.

## MVP mein kya hai

- Owner, Admin aur dono shift managers ke role concept
- 7 AM–7 PM Day Shift aur 7 PM–7 AM Night Shift
- Shift closing, meter readings aur cash reconciliation flow
- HSD/Diesel, PMG/Petrol aur HOBC ke liye 3-tank view
- Nozzle/meter readings aur fuel stock monitoring
- Expenses, other income, employees aur salaries ke sections
- Daily/monthly report screens aur export action
- Responsive desktop/tablet/mobile UI

## Run karne ka tareeqa

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Database recommendation

Production MVP ke liye **Supabase PostgreSQL** best fit hai: managed PostgreSQL, secure authentication, role-based policies, file storage (receipts/PDFs), backups aur realtime updates ek hi stack mein milte hain. Initial schema `supabase/schema.sql` mein diya gaya hai. Abhi UI demo data use karti hai; live deployment par Supabase client/API connect ki jayegi.

## Important formulas

- Sold litres = Current meter reading − Previous meter reading
- Sale amount = Sold litres × Shift ke waqt ka fuel rate
- Closing difference = Actual cash − Expected cash
- Tank stock = Opening stock + Received litres − Sold litres

## Next production steps

1. Supabase project bana kar `supabase/schema.sql` run karein.
2. Owner se Admin aur Manager accounts invite karein.
3. Station, tanks, nozzles aur fuel rates configure karein.
4. Receipt upload aur PDF generation ko storage/report API se connect karein.
5. Biometric attendance aur tank sensors ko Phase 2 mein add karein.
