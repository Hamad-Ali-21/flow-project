import React, {useState} from 'react';
import {ChartNoAxesCombined, CalendarDays, Download} from 'lucide-react';
import {downloadReport, reportData, reportPeriod, reportSections} from './reportExport';

const presets = {
  'Owner overview': reportSections,
  'Finance': ['Fuel Sales','Expenses','Utilities','Services','Other Income','Employees/Salaries'],
  'Operations': ['Fuel Sales','Services','Employees/Salaries','Tank Stock'],
};
const money = value => `PKR ${value.toLocaleString('en-PK')}`;

export default function ReportsPage({expenses,income,tanks,employees,today,notify}) {
  const [range,setRange] = useState('month');
  const [start,setStart] = useState(today);
  const [end,setEnd] = useState(today);
  const [reportType,setReportType] = useState('Owner overview');
  const [sections,setSections] = useState(reportSections);
  const [busy,setBusy] = useState(false);
  const period = reportPeriod(range,today,start,end);
  const valid = Boolean(period.start && period.end && period.start <= period.end && period.end <= today);
  const data = valid ? reportData({...period,expenses,income,today}) : null;
  const toggle = name => setSections(value => value.includes(name) ? value.filter(s => s !== name) : reportSections.filter(s => value.includes(s) || s === name));
  const generate = async () => {
    if (!valid || busy) return;
    setBusy(true);
    try {
      await downloadReport({...period,today,expenses,income,sections,reportType,tanks,employees});
      notify('Excel report downloaded');
    } catch (error) {
      console.error('Report export failed',error);
      notify('Unable to generate the Excel file. Please try again.');
    } finally { setBusy(false); }
  };
  return <>
    <div className="page-heading"><div><div className="eyebrow"><ChartNoAxesCombined size={15}/> OWNER / ADMIN REPORTING</div><h1>Reports</h1><p>Build an Excel summary from this station’s sample records.</p></div></div>
    <div className="report-grid">
      <section className="card report-config"><div className="card-head"><div><h2>Generate owner report</h2><p>Choose the period and the worksheets to include.</p></div></div>
        <div className="report-controls">
          <label>Report type<select value={reportType} onChange={e => {setReportType(e.target.value);setSections(presets[e.target.value]);}}>{Object.keys(presets).map(p => <option key={p}>{p}</option>)}</select></label>
          <label>Report range<select value={range} onChange={e => setRange(e.target.value)}><option value="today">Today</option><option value="week">This Week</option><option value="month">This Month</option><option value="custom">Custom</option></select></label>
          {range === 'custom' && <><label>From<input type="date" max={today} value={start} onChange={e => setStart(e.target.value)}/></label><label>To<input type="date" max={today} value={end} onChange={e => setEnd(e.target.value)}/></label></>}
        </div>
        {!valid && <p className="report-error" role="alert">Select a valid range ending no later than today (Karachi time).</p>}
        <div className="report-period"><CalendarDays size={17}/> {valid ? `${period.start} through ${period.end} · Karachi dates` : 'Choose a valid reporting period'}</div>
        <fieldset className="report-sections"><legend>Worksheets <small>Summary is always included</small></legend><div>{reportSections.map(section => <label key={section}><input type="checkbox" checked={sections.includes(section)} onChange={() => toggle(section)}/>{section}</label>)}</div></fieldset>
        <button className="button primary" disabled={!valid || busy} onClick={generate}><Download size={18}/>{busy ? 'Generating…' : 'Generate Excel'}</button>
      </section>
      <section className="card report-preview"><h2>Period snapshot</h2><p>From the selected demo and client-side records</p><div className="report-metrics">{[['Fuel sales',data?.fuelRevenue],['Fuel volume',data?.fuelLitres,' L'],['Expenses',data?.expenseTotal],['Other income',data?.incomeTotal],['Illustrative net',data && data.fuelRevenue + data.incomeTotal - data.expenseTotal]].map(([label,value,unit]) => <div key={label}><span>{label}</span><strong>{data ? unit ? `${value.toLocaleString('en-PK')}${unit}` : money(value) : '—'}</strong></div>)}</div><p className="report-note">Fuel sales are a single-day illustrative snapshot, not a sales ledger. Utilities are included in expenses; services are included in other income. Salary and tank sheets show current sample snapshots, regardless of range. This is not an accounting profit statement.</p></section>
    </div>
  </>;
}
