import React,{useEffect,useState} from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Add from './pages/Add'
import Actions from './pages/Actions'
import Memory from './pages/Memory'
import Settings from './pages/Settings'
import {getActions,getDashboard,updateAction} from './services/api'

const titles={home:'Home',chat:'Ask Actra',add:'Add to Actra',actions:'Actions',memory:'Memory',settings:'Settings'}

export default function App(){
  const [page,setPage]=useState('home'),[actions,setActions]=useState([]),[dashboard,setDashboard]=useState({today:0,urgent:0,completed:0}),[error,setError]=useState('')
  async function refresh(){
    try{const [a,d]=await Promise.all([getActions(),getDashboard()]);setActions(a);setDashboard(d);setError('')}
    catch(e){setError('Backend is not running. Start backend on port 3001.')}
  }
  useEffect(()=>{refresh()},[])
  async function status(id,status){await updateAction(id,{status});refresh()}
  function content(){
    if(page==='home')return <Home dashboard={dashboard} actions={actions} setPage={setPage} onStatus={status}/>
    if(page==='chat')return <Chat/>
    if(page==='add')return <Add onDone={refresh}/>
    if(page==='actions')return <Actions actions={actions} onStatus={status}/>
    if(page==='memory')return <Memory dashboard={dashboard}/>
    return <Settings/>
  }
  return <div className="app-shell"><Sidebar page={page} setPage={setPage}/><main className="main"><Topbar title={titles[page]} onAdd={()=>setPage('add')}/>{error&&<div className="backend-warning">{error}</div>}{content()}</main></div>
}
