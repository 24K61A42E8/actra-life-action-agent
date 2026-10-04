import React, {useState} from 'react'
import { ArrowUp, Bot, Sparkles, User } from 'lucide-react'
import { askActra } from '../services/api'

export default function Chat() {
  const [messages,setMessages] = useState([{role:'assistant',text:'Hi. I’m Actra. Give me a message, document, deadline or problem — I’ll turn it into clear next actions.'}])
  const [input,setInput] = useState('')
  const [busy,setBusy] = useState(false)
  async function send(e) {
    e?.preventDefault(); if(!input.trim()||busy) return
    const text=input.trim(); setInput(''); setMessages(m=>[...m,{role:'user',text}]); setBusy(true)
    try { const r=await askActra(text); setMessages(m=>[...m,{role:'assistant',text:r.reply}]) }
    catch(err){ setMessages(m=>[...m,{role:'assistant',text:'I could not reach the Actra backend. Make sure the backend is running on port 3001.'}]) }
    finally{setBusy(false)}
  }
  return <div className="chat-page">
    <div className="chat-intro"><div className="agent-badge"><Sparkles size={16}/> ACTRA AGENT</div><h2>What needs to get done?</h2><p>Ask Actra to understand, organize or plan something.</p></div>
    <div className="messages">
      {messages.map((m,i)=><div key={i} className={`message ${m.role}`}><div className="message-avatar">{m.role==='assistant'?<Bot size={17}/>:<User size={17}/>}</div><div className="message-bubble">{m.text}</div></div>)}
      {busy && <div className="message assistant"><div className="message-avatar"><Bot size={17}/></div><div className="message-bubble typing">Thinking<span>.</span><span>.</span><span>.</span></div></div>}
    </div>
    <form className="composer" onSubmit={send}><textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} placeholder="Tell Actra what you need..." rows="2"/><button><ArrowUp size={19}/></button></form>
  </div>
}
