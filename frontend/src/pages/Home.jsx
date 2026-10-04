import React from 'react'
import { ArrowUpRight, CalendarDays, CheckCircle2, Flame, Sparkles } from 'lucide-react'
import ActionCard from '../components/ActionCard'

export default function Home({dashboard, actions, setPage, onStatus}) {
  const today = actions.filter(a=>a.status!=='Done').slice(0,3)
  return <div className="page">
    <section className="hero-card">
      <div>
        <div className="hero-kicker"><Sparkles size={16}/> ACTRA AGENT</div>
        <h2>Turn information<br/><span>into action.</span></h2>
        <p>Actra understands documents, screenshots, messages and voice notes — then helps you finish what matters.</p>
        <button className="primary" onClick={()=>setPage('add')}>Give Actra something to work on <ArrowUpRight size={17}/></button>
      </div>
      <div className="hero-orb">
        <img src="/src/assets/actra-logo.jpg" alt="Actra AI robot"/>
      </div>
    </section>

    <div className="stats-grid">
      <div className="stat"><div className="stat-icon"><CalendarDays/></div><span>Today</span><b>{dashboard.today}</b><small>actions waiting</small></div>
      <div className="stat"><div className="stat-icon urgent"><Flame/></div><span>Urgent</span><b>{dashboard.urgent}</b><small>need attention</small></div>
      <div className="stat"><div className="stat-icon done"><CheckCircle2/></div><span>Completed</span><b>{dashboard.completed}</b><small>all time</small></div>
    </div>

    <div className="section-head"><div><div className="eyebrow">YOUR ATTENTION</div><h3>Today's actions</h3></div><button className="ghost" onClick={()=>setPage('actions')}>View all →</button></div>
    <div className="action-list">{today.length ? today.map(a=><ActionCard key={a.id} item={a} onStatus={onStatus}/>) : <div className="empty">You're clear. Add something for Actra to handle.</div>}</div>
  </div>
}
