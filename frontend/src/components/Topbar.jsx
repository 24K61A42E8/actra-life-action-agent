import React from 'react'
import { Bell, Search } from 'lucide-react'

export default function Topbar({title, onAdd}) {
  return <header className="topbar">
    <div><div className="eyebrow">ACTRA WORKSPACE</div><h1>{title}</h1></div>
    <div className="top-actions">
      <div className="search"><Search size={16}/><input placeholder="Search actions..." /></div>
      <button className="icon-button"><Bell size={18}/></button>
      <button className="add-button" onClick={onAdd}>+ Add</button>
      <div className="avatar">SG</div>
    </div>
  </header>
}
