import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import api from './routes/api.js'

const app=express()
const port=Number(process.env.PORT||3001)
fs.mkdirSync(path.resolve('uploads'),{recursive:true})
app.use(cors())
app.use(express.json({limit:'2mb'}))
app.use('/api',api)
app.get('/',(req,res)=>res.json({name:'Actra',description:'AI Life Action Agent',status:'running'}))
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({error:'Unexpected server error'})})
app.listen(port,()=>console.log(`Actra backend running at http://localhost:${port}`))
