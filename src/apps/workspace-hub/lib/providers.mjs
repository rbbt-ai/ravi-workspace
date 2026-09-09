import {command} from './native.mjs';
export async function setting(key,run=command){
 const raw=await run(['settings','get',key],{json:false}),prefix=key+': ';
 if(!raw.startsWith(prefix))throw Error('CREDENTIAL_UNAVAILABLE');
 const value=raw.slice(prefix.length).trim();
 if(!value||['null','undefined'].includes(value)||/[\r\n]/.test(value))throw Error('CREDENTIAL_UNAVAILABLE');
 return value;
}
export async function request(url,options={}){
 let response;try{response=await fetch(url,{...options,redirect:'error',signal:AbortSignal.timeout(30000)});}catch{throw Error('PROVIDER_UNAVAILABLE');}
 if(!response.ok)throw Error(response.status===401?'AUTH_EXPIRED':response.status===403?'ACCESS_DENIED':response.status===404?'NOT_FOUND':'PROVIDER_UNAVAILABLE');
 const raw=await response.text();if(raw.length>8000000)throw Error('PROVIDER_RESPONSE_LIMIT');
 try{return JSON.parse(raw);}catch{throw Error('PROVIDER_CONTRACT_CHANGED');}
}
const link=(value,hosts)=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&hosts.includes(u.hostname)?u.href:'';}catch{return '';}};
// Find each civil midnight in the configured IANA zone, including DST changes.
export function dayBounds(timezone,now=new Date()){
 const format=new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'});
 const day=d=>{const p=Object.fromEntries(format.formatToParts(d).map(p=>[p.type,p.value]));return `${p.year}-${p.month}-${p.day}`;};
 const date=day(now),target=Date.parse(date+'T00:00:00Z');
 const boundary=key=>{let lo=target-48*3600000,hi=target+72*3600000;while(hi-lo>1){const mid=Math.floor((lo+hi)/2);if(day(new Date(mid))<key)lo=mid;else hi=mid;}return new Date(hi).toISOString();};
 const next=new Date(target+86400000).toISOString().slice(0,10);
 return {date,from:boundary(date),through:boundary(next)};
}
export async function calendar(config,{get=request,read=setting,now=new Date()}={}){
 const fields=['client_id','client_secret','refresh_token'];const body=new URLSearchParams({grant_type:'refresh_token'});
 for(const field of fields)body.set(field,await read('integrations.google_calendar.workspace.'+field));
 const token=await get('https://oauth2.googleapis.com/token',{method:'POST',body});body.forEach((_,k)=>body.set(k,''));
 if(typeof token.access_token!=='string')throw Error('AUTH_EXPIRED');
 const headers={Authorization:'Bearer '+token.access_token};
 const identity=await get('https://www.googleapis.com/calendar/v3/calendars/primary?fields=id,timeZone',{headers});
 if(!config.integrations.agenda.account||identity.id!==config.integrations.agenda.account)throw Error('ACCOUNT_MISMATCH');
 const bounds=dayBounds(config.timezone,now),params=new URLSearchParams({timeMin:bounds.from,timeMax:bounds.through,singleEvents:'true',orderBy:'startTime',maxResults:'100',timeZone:config.timezone,fields:'nextPageToken,items(id,summary,status,start,end,htmlLink,attendees(self,responseStatus))'});
 const items=[],seen=new Set(),pages=new Set();
 for(let page=0;page<10;page++){
  const raw=await get('https://www.googleapis.com/calendar/v3/calendars/primary/events?'+params,{headers});
  if(!Array.isArray(raw.items))throw Error('PROVIDER_CONTRACT_CHANGED');
  for(const e of raw.items){if(typeof e.id!=='string')throw Error('PROVIDER_CONTRACT_CHANGED');if(seen.has(e.id))continue;seen.add(e.id);
   const response=e.attendees?.find(a=>a.self)?.responseStatus||'unknown';if(e.status==='cancelled'||response==='declined')continue;
   items.push({id:e.id,title:e.summary||'Sem título',start:e.start?.dateTime||e.start?.date,end:e.end?.dateTime||e.end?.date,allDay:Boolean(e.start?.date),response,url:link(e.htmlLink,['www.google.com','calendar.google.com'])});
  }
  if(!raw.nextPageToken)return {status:'ready',source:'Google Calendar · '+identity.id,capturedAt:now.toISOString(),...bounds,timezone:config.timezone,items,url:'https://calendar.google.com',description:'Agenda principal; consulta do dia civil completo.',limit:'Exclui cancelamentos e convites recusados. Outros calendários não consultados.'};
  if(pages.has(raw.nextPageToken))throw Error('INCOMPLETE_PROVIDER_PAGE');pages.add(raw.nextPageToken);params.set('pageToken',raw.nextPageToken);
 }
 throw Error('INCOMPLETE_PROVIDER_PAGE');
}
export async function meetings(config,{get=request,read=setting,now=new Date()}={}){
 const key=await read('integrations.tldv.apiKey'),headers={'x-api-key':key};
 const items=[],seen=new Set(),cutoff=now.getTime()-config.historyDays*86400000;
 for(let page=1;page<=30;page++){
  const raw=await get('https://pasta.tldv.io/v1alpha1/meetings?page='+page+'&limit=5',{headers});
  if(!Array.isArray(raw.results)||!Number.isInteger(raw.pages))throw Error('PROVIDER_CONTRACT_CHANGED');
  for(const m of raw.results){
   if(typeof m.id!=='string'||!/^[-a-zA-Z0-9_]+$/.test(m.id)||!Number.isFinite(Date.parse(m.happenedAt)))throw Error('PROVIDER_CONTRACT_CHANGED');
   if(seen.has(m.id))continue;seen.add(m.id);const date=Date.parse(m.happenedAt);if(date<cutoff||date>now.getTime())continue;
   let transcript;try{transcript=await get('https://pasta.tldv.io/v1alpha1/meetings/'+encodeURIComponent(m.id)+'/transcript',{headers});}catch(e){if(e.message==='NOT_FOUND')continue;throw e;}
   if(transcript.meetingId!==m.id||!Array.isArray(transcript.data))throw Error('PROVIDER_CONTRACT_CHANGED');
   const segments=transcript.data.length;transcript=null;
   if(segments)items.push({id:m.id,title:m.name||'Sem título',happenedAt:new Date(date).toISOString(),segments,url:link(m.url,['tldv.io','app.tldv.io'])});
  }
  if(items.length>=5||page>=raw.pages||!raw.results.length)return {status:'ready',source:'tl;dv · acesso existente',capturedAt:now.toISOString(),from:new Date(cutoff).toISOString(),through:now.toISOString(),items:items.sort((a,b)=>b.happenedAt.localeCompare(a.happenedAt)).slice(0,5),url:'https://tldv.io/app/meetings',description:'Reuniões recentes com transcrição não vazia confirmada.',limit:'Titular da chave não verificado. Temas dependem de síntese revisada; transcrições não são persistidas.'};
 }
 throw Error('INCOMPLETE_PROVIDER_PAGE');
}
