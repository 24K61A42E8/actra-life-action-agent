import React,{useRef,useState} from 'react'
import { FileText, Image, MessageSquare, Mic, UploadCloud, CheckCircle2 } from 'lucide-react'
import { ingestText, uploadFile } from '../services/api'

export default function Add({onDone}) {
  const [text,setText]=useState(''); const [busy,setBusy]=useState(false); const [result,setResult]=useState(null)
  const ref=useRef()
  async function submitText(){
    if(!text.trim()) return; setBusy(true)
    try{const r=await ingestText(text);setResult(r);setText('');onDone?.()}catch(e){setResult({error:e.message})}finally{setBusy(false)}
  }
  async function fileChange(e){
    const file=e.target.files?.[0]; if(!file)return; setBusy(true)
    try{const r=await uploadFile(file);setResult(r);onDone?.()}catch(e){setResult({error:e.message})}finally{setBusy(false)}
  }
  return <div className="page">
    <div className="section-head"><div><div className="eyebrow">CAPTURE</div><h3>Give Actra something to understand</h3><p className="muted">Actra extracts actions first. You review them before anything consequential happens.</p></div></div>
    <div className="input-grid">
      <button className="input-tile" onClick={()=>ref.current?.click()}><div className="tile-icon"><UploadCloud/></div><b>PDF / Document</b><span>Upload a notice, bill, assignment or file</span></button>
      <button className="input-tile" onClick={()=>ref.current?.click()}><div className="tile-icon"><Image/></div><b>Screenshot / Image</b><span>Let Actra read important visual information</span></button>
      <button className="input-tile" onClick={()=>document.getElementById('voice-input').click()}><div className="tile-icon"><Mic/></div><b>Voice note</b><span>Upload an audio recording</span></button>
      <div className="input-tile text-tile"><div className="tile-icon"><MessageSquare/></div><b>Paste text</b><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Paste a message, email, notice or anything you need to act on..."/><button className="primary small" disabled={busy||!text.trim()} onClick={submitText}>{busy?'Processing...':'Process with Actra'}</button></div>
    </div>
    <input ref={ref} type="file" hidden accept=".pdf,.txt,.png,.jpg,.jpeg" onChange={fileChange}/>
    <input id="voice-input" type="file" hidden accept="audio/*" onChange={fileChange}/>
    {result && <div className={`result-card ${result.error?'error':''}`}><CheckCircle2/><div><b>{result.error?'Could not process':'Actra processed your input'}</b><p>{result.error || `Created ${result.created || 0} action(s).`}</p></div></div>}
  </div>
}
