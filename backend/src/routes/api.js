import express from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import pdf from 'pdf-parse'
import {allActions,addAction,updateAction,addDocument,addPerson,dashboard} from '../storage/store.js'
import {extract} from '../agents/extractor.js'
import {generateReply} from '../services/aiProvider.js'

const router=express.Router()
const upload=multer({dest:path.resolve('uploads/'),limits:{fileSize:20*1024*1024}})

router.get('/health',(req,res)=>res.json({success:true,service:'actra-backend',aiProvider:process.env.AI_PROVIDER||'demo'}))
router.get('/actions',(req,res)=>res.json(allActions()))
router.get('/dashboard',(req,res)=>res.json(dashboard()))
router.patch('/actions/:id',(req,res)=>{const item=updateAction(req.params.id,req.body);if(!item)return res.status(404).json({error:'Action not found'});res.json(item)})

router.post('/ingest/text',(req,res)=>{
 try{
  const {text,title='Text input'}=req.body||{}
  if(!text?.trim())return res.status(400).json({error:'Text is required'})
  const result=extract(text,title)
  result.actions.forEach(addAction);result.people.forEach(addPerson)
  addDocument({title,type:'text',summary:result.summary})
  res.json({success:true,created:result.actions.length,actions:result.actions,summary:result.summary})
 }catch(e){res.status(500).json({error:e.message})}
})

router.post('/ingest/file',upload.single('file'),async(req,res)=>{
 try{
  if(!req.file)return res.status(400).json({error:'File is required'})
  let text=''
  const original=req.file.originalname
  const ext=path.extname(original).toLowerCase()
  if(ext==='.pdf'){
    const data=await pdf(fs.readFileSync(req.file.path));text=data.text||''
  }else if(ext==='.txt'){text=fs.readFileSync(req.file.path,'utf8')}
  else if(ext.match(/\.(png|jpg|jpeg)$/)){
    text='Image uploaded. OCR integration is ready for the AI provider layer; add OCR processing in the next iteration.'
  }else if(ext.match(/\.(mp3|wav|m4a|webm|ogg)$/)){
    text='Voice note uploaded. Connect an OpenAI-compatible transcription key to enable automatic speech-to-text.'
  }else{text=fs.readFileSync(req.file.path,'utf8')}
  const result=extract(text,original)
  result.actions.forEach(addAction);result.people.forEach(addPerson)
  addDocument({title:original,type:ext.slice(1)||'file',summary:result.summary})
  res.json({success:true,created:result.actions.length,actions:result.actions,summary:result.summary})
 }catch(e){res.status(500).json({error:e.message})}
})

router.post('/chat',async(req,res)=>{
 try{
  const message=req.body?.message
  if(!message?.trim())return res.status(400).json({error:'Message is required'})
  const reply=await generateReply(message)
  res.json({success:true,reply})
 }catch(e){res.status(500).json({error:e.message})}
})

export default router
