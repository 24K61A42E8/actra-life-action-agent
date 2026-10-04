import 'dotenv/config'

export async function generateReply(message){
 const provider=(process.env.AI_PROVIDER||'demo').toLowerCase()
 if(provider==='openai' && process.env.OPENAI_API_KEY){
   const body={model:process.env.OPENAI_MODEL||'gpt-4o-mini',messages:[
    {role:'system',content:'You are Actra, an AI life action agent. Help users turn information into clear, safe next actions. Do not claim to have performed external actions. Ask clarification when needed.'},
    {role:'user',content:message}
   ],temperature:0.2}
   const r=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify(body)})
   if(!r.ok)throw new Error('OpenAI request failed')
   const j=await r.json();return j.choices?.[0]?.message?.content||'I could not generate a response.'
 }
 if(provider==='gemini' && process.env.GEMINI_API_KEY){
   const model=process.env.GEMINI_MODEL||'gemini-2.0-flash'
   const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:`You are Actra, an AI life action agent. Help users turn information into clear, safe next actions. Do not claim to have performed external actions.\\n\\n${message}`}]}]})})
   if(!r.ok)throw new Error('Gemini request failed')
   const j=await r.json();return j.candidates?.[0]?.content?.parts?.[0]?.text||'I could not generate a response.'
 }
 return `I understand. In demo mode, I would turn this into structured actions, deadlines and follow-ups.\\n\\nYou said: “${message.slice(0,500)}”\\n\\nAdd an AI provider key in backend/.env to enable live reasoning.`
}
