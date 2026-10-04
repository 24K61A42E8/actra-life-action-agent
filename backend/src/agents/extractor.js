function dateFromText(text){
  const iso=text.match(/\b(20\d{2})[-\/](\d{1,2})[-\/](\d{1,2})\b/)
  if(iso)return `${iso[1]}-${String(iso[2]).padStart(2,'0')}-${String(iso[3]).padStart(2,'0')}`
  const dmy=text.match(/\b(\d{1,2})[\/.-](\d{1,2})[\/.-](20\d{2})\b/)
  if(dmy)return `${dmy[3]}-${String(dmy[2]).padStart(2,'0')}-${String(dmy[1]).padStart(2,'0')}`
  const months={january:1,february:2,march:3,april:4,may:5,june:6,july:7,august:8,september:9,october:10,november:11,december:12}
  const m=text.match(/\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})\b/i)
  if(m)return `${m[3]}-${String(months[m[2].toLowerCase()]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`
  return null
}
function peopleFromText(text){
 const names=new Set()
 const re=/\b(?:send|share|give|contact|tell|meet|with)\s+(?:it\s+to\s+)?([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})?)/g
 let m;while((m=re.exec(text)))names.add(m[1])
 return [...names]
}
export function extract(text,title='Source'){
 const lines=text.split(/\n+/).map(x=>x.trim()).filter(Boolean)
 const deadline=dateFromText(text)
 const people=peopleFromText(text)
 const taskLines=lines.filter(l=>/^(submit|send|complete|finish|pay|register|apply|upload|attend|bring|call|contact|prepare|book|renew|reply|schedule|download|fill|return|visit|meet)\b/i.test(l)||/\b(deadline|due|must|required|need to|needs to|should)\b/i.test(l))
 const unique=[...new Set(taskLines)]
 const actions=unique.slice(0,8).map((line,i)=>({
   title:line.replace(/^[-•]\s*/,'').slice(0,180),
   deadline,
   person:people[0]||null,
   priority:/urgent|asap|immediately|today/i.test(line)?'Urgent':'Normal',
   reason:`Actra found this action in ${title}.`
 }))
 if(!actions.length && text.trim()){
   actions.push({title:'Review the information from this input',deadline,person:people[0]||null,priority:'Normal',reason:`Actra could not identify a specific command, so it created a review action from ${title}.`})
 }
 return {actions,people,summary:text.replace(/\s+/g,' ').slice(0,500)}
}
