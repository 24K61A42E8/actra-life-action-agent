import React from 'react'
export default function Settings(){
  return <div className="page"><div className="section-head"><div><div className="eyebrow">CONTROL CENTER</div><h3>Settings</h3></div></div>
    <div className="settings-card">
      <div className="setting-row"><div><b>Notifications</b><span>Deadline and follow-up reminders</span></div><label className="switch"><input type="checkbox" defaultChecked/><i/></label></div>
      <div className="setting-row"><div><b>Daily briefing</b><span>Show a morning summary of open actions</span></div><label className="switch"><input type="checkbox" defaultChecked/><i/></label></div>
      <div className="setting-row"><div><b>Approval-first actions</b><span>Require confirmation before consequential actions</span></div><label className="switch"><input type="checkbox" defaultChecked/><i/></label></div>
      <div className="setting-row"><div><b>AI provider</b><span>Configured in backend .env</span></div><span className="pill">Provider independent</span></div>
    </div>
  </div>
}
