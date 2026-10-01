import React from 'react';
import {Banknote, MoreHorizontal, Plus, Search} from 'lucide-react';

const money = n => `PKR ${n.toLocaleString('en-PK')}`;
const dateLabel = iso => new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',day:'numeric',month:'short',year:'numeric'}).format(new Date(`${iso}T00:00:00Z`));

export default function IncomePage({income,search,setModal}) {
  const query = search.trim().toLowerCase();
  const filtered = income.filter(item => !query || Object.values(item).join(' ').toLowerCase().includes(query));
  const total = filtered.reduce((sum,item) => sum + item.amount,0);
  return <>
    <div className="page-heading"><div><div className="eyebrow"><Banknote size={15}/> STATION MANAGEMENT</div><h1>Other income</h1><p>Track revenue outside of fuel sales</p></div><button className="button primary" onClick={() => setModal('income')}><Plus size={18}/>Add income</button></div>
    <div className="expense-summary-strip"><div><span>Matching income</span><strong className="expense-total">{money(total)}</strong></div><div><span>Matching records</span><strong className="expense-count">{filtered.length}</strong></div></div>
    <div className="card table-page"><div className="table-toolbar"><div><h2>Other income register</h2><p>Use the header search; select a row to view details.</p></div><div className="table-search search"><Search size={15}/><input value={search} readOnly placeholder="Search other income"/></div></div><div className="table-wrap"><table><thead><tr>{['Income source','Category','Date','Amount','Status',''].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{filtered.map(item => <tr className="clickable-row" key={item.id} onClick={() => setModal({type:'incomeDetail',income:item})}><td><strong className="row-title">{item.name}</strong></td><td>{item.category}</td><td>{dateLabel(item.date)}</td><td>{money(item.amount)}</td><td><span className="status success">{item.status}</span></td><td><button className="more" aria-label={`View ${item.name} details`} onClick={event => {event.stopPropagation();setModal({type:'incomeDetail',income:item});}}><MoreHorizontal size={18}/></button></td></tr>)}</tbody></table></div>{!filtered.length && <p className="empty-state">No other income matches your search.</p>}</div>
  </>;
}
