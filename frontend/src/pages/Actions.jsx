import React from 'react'
import ActionCard from '../components/ActionCard'
export default function Actions({actions,onStatus}) {
  return <div className="page"><div className="section-head"><div><div className="eyebrow">ACTION BOARD</div><h3>Everything that needs your attention</h3></div></div>
    <div className="filter-row"><span>{actions.length} total</span><span>Pending · In Progress · Done</span></div>
    <div className="action-list">{actions.map(a=><ActionCard key={a.id} item={a} onStatus={onStatus}/>)}</div>
  </div>
}
