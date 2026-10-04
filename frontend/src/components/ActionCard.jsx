import React from 'react'
import { CalendarClock, CheckCircle2, Circle, Clock3, Info, UserRound } from 'lucide-react'

export default function ActionCard({item, onStatus}) {
  const statusClass = item.status.toLowerCase().replace(' ','-')
  return <div className={`action-card ${statusClass}`}>
    <div className="action-main">
      <div className="action-icon">
        {item.status==='Done' ? <CheckCircle2/> : item.priority==='Urgent' ? <Clock3/> : <Circle/>}
      </div>
      <div className="action-copy">
        <div className="action-title">{item.title}</div>
        <div className="action-meta">
          {item.deadline && <span><CalendarClock size={14}/>{item.deadline}</span>}
          {item.person && <span><UserRound size={14}/>{item.person}</span>}
        </div>
      </div>
      <select value={item.status} onChange={e=>onStatus(item.id,e.target.value)} className="status-select">
        <option>Pending</option><option>In Progress</option><option>Done</option>
      </select>
    </div>
    {item.reason && <div className="why"><Info size={14}/><span><b>Why:</b> {item.reason}</span></div>}
  </div>
}
