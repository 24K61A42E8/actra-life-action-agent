import React from 'react'
import { Brain, FileText, Link2, Users } from 'lucide-react'
export default function Memory({dashboard}) {
  const cards=[
    ['People','People mentioned in your information',dashboard.people||0,Users],
    ['Commitments','Things you promised or need to follow up',dashboard.commitments||0,Link2],
    ['Documents','Sources Actra has processed',dashboard.documents||0,FileText]
  ]
  return <div className="page"><div className="section-head"><div><div className="eyebrow">LONG-TERM CONTEXT</div><h3>Actra Memory</h3><p className="muted">A traceable memory of useful context behind your actions.</p></div></div>
    <div className="memory-hero"><Brain size={28}/><div><b>Context, not clutter.</b><p>Actra keeps structured facts connected to the actions they explain.</p></div></div>
    <div className="stats-grid">{cards.map(([title,desc,count,Icon])=><div className="stat memory-stat" key={title}><Icon size={22}/><span>{title}</span><b>{count}</b><small>{desc}</small></div>)}</div>
  </div>
}
