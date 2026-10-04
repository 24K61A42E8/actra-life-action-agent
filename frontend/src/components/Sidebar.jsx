import React from 'react'
import { Home, MessageSquare, Plus, ListChecks, Brain, Settings, Sparkles } from 'lucide-react'

export default function Sidebar({page, setPage}) {
  const items = [
    ['home','Home',Home],
    ['chat','Ask Actra',MessageSquare],
    ['add','Add',Plus],
    ['actions','Actions',ListChecks],
    ['memory','Memory',Brain],
    ['settings','Settings',Settings],
  ]
  return <aside className="sidebar">
    <div className="brand">
      <div className="brand-mark"><Sparkles size={18}/></div>
      <div><div className="brand-name">ACTRA</div><div className="brand-sub">AI LIFE ACTION AGENT</div></div>
    </div>
    <nav>
      {items.map(([id,label,Icon]) =>
        <button key={id} className={`nav-item ${page===id?'active':''}`} onClick={()=>setPage(id)}>
          <Icon size={18}/><span>{label}</span>
        </button>
      )}
    </nav>
    <div className="sidebar-bottom">
      <div className="mini-agent"><span className="pulse-dot"/> Agent online</div>
    </div>
  </aside>
}
