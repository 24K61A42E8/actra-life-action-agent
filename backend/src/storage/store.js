import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(__dirname, '../../data')
const DB_FILE = path.join(DATA_DIR, 'actra.json')
fs.mkdirSync(DATA_DIR,{recursive:true})

const initial = {actions:[], people:[], commitments:[], documents:[], memories:[]}
function read(){if(!fs.existsSync(DB_FILE))fs.writeFileSync(DB_FILE,JSON.stringify(initial,null,2));return JSON.parse(fs.readFileSync(DB_FILE,'utf8'))}
function write(db){fs.writeFileSync(DB_FILE,JSON.stringify(db,null,2))}
export function allActions(){return read().actions.sort((a,b)=>(a.deadline||'9999').localeCompare(b.deadline||'9999'))}
export function addAction(action){const db=read();const item={id:crypto.randomUUID(),status:'Pending',priority:'Normal',createdAt:new Date().toISOString(),...action};db.actions.push(item);write(db);return item}
export function updateAction(id,patch){const db=read();const item=db.actions.find(x=>x.id===id);if(!item)return null;Object.assign(item,patch,{updatedAt:new Date().toISOString()});write(db);return item}
export function addDocument(doc){const db=read();db.documents.push({id:crypto.randomUUID(),createdAt:new Date().toISOString(),...doc});write(db)}
export function addPerson(name){if(!name)return;const db=read();if(!db.people.some(p=>p.name.toLowerCase()===name.toLowerCase()))db.people.push({id:crypto.randomUUID(),name});write(db)}
export function dashboard(){
 const db=read(), today=new Date().toISOString().slice(0,10)
 return {today:db.actions.filter(a=>a.status!=='Done' && (!a.deadline||a.deadline.startsWith(today))).length,
 urgent:db.actions.filter(a=>a.status!=='Done'&&a.priority==='Urgent').length,
 completed:db.actions.filter(a=>a.status==='Done').length,
 people:db.people.length, commitments:db.commitments.length, documents:db.documents.length}
}
