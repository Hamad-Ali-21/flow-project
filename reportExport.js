// All source records in this demo are illustrative. Keep figures numeric for Excel.
export const fuelSales = [
  {product:'Diesel / HSD', date:null, litres:1800, revenue:486000, source:'Sample sales overview'},
  {product:'Petrol / PMG', date:null, litres:1532, revenue:419462, source:'Sample sales overview'},
];

export const reportSections = ['Fuel Sales','Expenses','Utilities','Services','Other Income','Employees/Salaries','Tank Stock'];

export function reportPeriod(range, today, customStart, customEnd) {
  if (range === 'custom') return {start:customStart,end:customEnd};
  const [year, month, day] = today.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (range === 'week') date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  if (range === 'month') date.setUTCDate(1);
  return {start:date.toISOString().slice(0,10), end:today};
}

export function reportData({start,end,expenses,income,today}) {
  const within = item => item.date >= start && item.date <= end;
  const costs = expenses.filter(within);
  const earnings = income.filter(within);
  // Fuel figures are a single-day sample, not a reconstructed sales ledger.
  const fuel = start <= today && today <= end ? fuelSales.map(s => ({...s,date:today})) : [];
  const utilities = costs.filter(e => e.category.toLowerCase() === 'utilities');
  const services = earnings.filter(e => /service/i.test(e.category));
  const sum = (records, field) => records.reduce((total, row) => total + Number(row[field] || 0), 0);
  return {costs,earnings,fuel,utilities,services,
    fuelRevenue:sum(fuel,'revenue'),fuelLitres:sum(fuel,'litres'),expenseTotal:sum(costs,'amount'),
    incomeTotal:sum(earnings,'amount'),utilityTotal:sum(utilities,'amount'),serviceTotal:sum(services,'amount')};
}

export async function downloadReport({start,end,today,expenses,income,sections,reportType,tanks,employees}) {
  const XLSX = await import('xlsx');
  const data = reportData({start,end,expenses,income,today});
  const workbook = XLSX.utils.book_new();
  const sheet = (name, headers, rows) => {
    const ws = XLSX.utils.aoa_to_sheet([headers,...rows]);
    ws['!cols'] = headers.map((header, index) => ({wch:Math.min(44,Math.max(header.length + 3,...rows.map(row => String(row[index] ?? '').length + 2),14))}));
    XLSX.utils.book_append_sheet(workbook,ws,name);
  };
  sheet('Summary',['Metric','Value','Notes'],[
    ['Station','FLOW · Gujranwala','Demo / sample data — not live station records'],
    ['Report type',reportType,'Owner/Admin export'],
    ['Period start',start,'Karachi calendar dates'],['Period end',end,'Inclusive'],['Generated on',today,'Asia/Karachi'],
    ['Fuel revenue (PKR)',data.fuelRevenue,'Single-day illustrative sales snapshot; no transaction history'],
    ['Fuel volume (L)',data.fuelLitres,'Single-day illustrative sales snapshot'],
    ['Expenses (PKR)',data.expenseTotal,'Includes utilities; do not add utilities again'],
    ['Utilities (PKR)',data.utilityTotal,'Subset of expenses'],
    ['Other income (PKR)',data.incomeTotal,'Includes services; do not add services again'],
    ['Services (PKR)',data.serviceTotal,'Subset of other income'],
    ['Illustrative net (PKR)',data.fuelRevenue + data.incomeTotal - data.expenseTotal,'Fuel sales sample + other income − expenses; not accounting profit'],
    ['Salary register (PKR/month)',employees.reduce((n,e) => n + Number(String(e[4]).replace(/[^\d]/g,'')),0),'Current sample roster; monthly amount, not period expense'],
    ['Tank stock (L)',tanks.reduce((n,t) => n+t.stock,0),'Current sample snapshot, not period movement'],
    ['Included sections',sections.join(', ') || 'Summary only','Empty sheets are retained with headers'],
  ]);
  const expenseRows = records => records.map(e => [e.date,e.name,e.category,e.amount,e.paymentMethod,e.description]);
  const incomeRows = records => records.map(e => [e.date,e.name,e.category,e.amount,e.status,e.description]);
  if(sections.includes('Fuel Sales')) sheet('Fuel Sales',['Date','Product','Litres','Revenue (PKR)','Source'],data.fuel.map(f => [f.date,f.product,f.litres,f.revenue,f.source]));
  if(sections.includes('Expenses')) sheet('Expenses',['Date','Expense','Category','Amount (PKR)','Payment method','Description'],expenseRows(data.costs));
  if(sections.includes('Utilities')) sheet('Utilities',['Date','Expense','Category','Amount (PKR)','Payment method','Description'],expenseRows(data.utilities));
  if(sections.includes('Services')) sheet('Services',['Date','Income source','Category','Amount (PKR)','Status','Description'],incomeRows(data.services));
  if(sections.includes('Other Income')) sheet('Other Income',['Date','Income source','Category','Amount (PKR)','Status','Description'],incomeRows(data.earnings));
  if(sections.includes('Employees/Salaries')) sheet('Employees Salaries',['Employee','Role','Shift','Status','Monthly salary (PKR)'],employees.map(e => [...e.slice(0,4),Number(String(e[4]).replace(/[^\d]/g,''))]));
  if(sections.includes('Tank Stock')) sheet('Tank Stock',['Tank','Product','Capacity (L)','Stock (L)','Dip reading','Calibration','Nozzles','Status'],tanks.map(t => [t.id,t.product,t.capacity,t.stock,t.dip,t.calibration,t.nozzles,t.status]));
  XLSX.writeFile(workbook,`FLOW-Owner-Report-${today}-${start}-to-${end}.xlsx`,{compression:true});
}
