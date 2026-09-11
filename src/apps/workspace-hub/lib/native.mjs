import {execFile} from 'node:child_process';
import {createNativeCommand} from './sdk.mjs';
const identifier=v=>typeof v==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,159}$/.test(v);
const text=(v,n=1600)=>{
 if(typeof v!=='string')return '';
 if(/(?:rctx_|gh[pousr]_|github_pat_|sk-)[A-Za-z0-9_-]{16,}|-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(v))throw Error('SENSITIVE_SOURCE_CONTENT');
 return v.slice(0,n);
};
export function cliCommand(args,{json=true,timeout=25000}={}){
 return new Promise((resolve,reject)=>execFile('ravi',args,{timeout,maxBuffer:2500000},(error,stdout)=>{
  if(error)return reject(Error('SOURCE_UNAVAILABLE'));
  try{resolve(json?JSON.parse(stdout):stdout);}catch{
   const readonly=[['sessions','read'],['artifacts','show'],['artifacts','list']].some(a=>a[0]===args[0]&&a[1]===args[1]);
   if(!readonly||stdout.length<64000||!stdout.trimStart().startsWith('{'))return reject(Error('SOURCE_CONTRACT_CHANGED'));
   execFile('python3',[new URL('./read-cli-tty.py',import.meta.url).pathname,...args],{timeout:30000,maxBuffer:4500000},(error,complete)=>{
    if(error)return reject(Error('SOURCE_CONTRACT_CHANGED'));try{resolve(JSON.parse(complete));}catch{reject(Error('SOURCE_CONTRACT_CHANGED'));}
   });
  }
 }));
}
export const command=createNativeCommand({cli:cliCommand});
export const sdkDiagnostics=()=>command.diagnostics();
export async function nativeRows(kind,days,run=command){
 const rows=[],seen=new Set(),started=new Date(),since=new Date(started.getTime()-days*86400000).toISOString();
 let offset=0,cursor,total;
 for(let page=0;page<200;page++){
  const args=kind==='tasks'?['tasks','list','--since',since,'--until',started.toISOString(),'--limit','1','--last','all','--sort','updated','--order','desc',...(cursor?['--cursor',cursor]:[]),'--json']:[kind,'list','--limit','100','--offset',String(offset),'--json'];
  const raw=await run(args),items=raw.items,p=kind==='tasks'?raw.page:raw.pagination;
  if(!Array.isArray(items)||!p||typeof p.hasMore!=='boolean')throw Error('SOURCE_CONTRACT_CHANGED');
  if(kind!=='tasks'){total??=p.total;if(total!==p.total||p.offset!==offset||p.returned!==items.length)throw Error('UNSTABLE_INVENTORY');}
  for(const row of items){if(!identifier(row.id)||seen.has(row.id))throw Error('INVALID_NATIVE_ID');seen.add(row.id);rows.push(row);}
  if(rows.length>2000)throw Error('INVENTORY_LIMIT');
  if(!p.hasMore){if(kind!=='tasks'&&rows.length!==total)throw Error('INCOMPLETE_INVENTORY');return rows;}
  if(!items.length)throw Error('INCOMPLETE_INVENTORY');
  if(kind==='tasks'){if(!p.nextCursor||p.nextCursor===cursor)throw Error('INCOMPLETE_INVENTORY');cursor=p.nextCursor;}
  else{if(p.nextOffset!==offset+items.length)throw Error('INCOMPLETE_INVENTORY');offset=p.nextOffset;}
 }
 throw Error('INVENTORY_LIMIT');
}
// SDK returns structured metadata; the existing table contract remains only for
// local operator/explicitly absent SDK route. Never infer execution from recency.
export async function sessionRows(run=command){
 let offset=0,total;const rows=[],seen=new Set();
 for(let page=0;page<200;page++){
  const raw=await run(['sessions','list','--limit','10','--offset',String(offset)],{json:false,sessionMetadata:true});
  if(raw&&typeof raw==='object'){
   const items=raw.items,p=raw.pagination;
   if(!Array.isArray(items)||!p||!Number.isSafeInteger(p.total)||p.total<0||p.offset!==offset||p.returned!==items.length||typeof p.hasMore!=='boolean')throw Error('SESSION_METADATA_CONTRACT_CHANGED');
   total??=p.total;if(total!==p.total)throw Error('UNSTABLE_INVENTORY');
   for(const item of items){
    const id=item.name||item.sessionKey;
    if(!identifier(id)||!identifier(item.agentId)||typeof item.ephemeral!=='boolean'||seen.has(id))throw Error('INVALID_SESSION_METADATA');
    seen.add(id);if(item.ephemeral||/^(eval|cron|task-)/i.test(id))continue;
    const label=item.displayName||item.lastTo||id;
    rows.push({id,name:/\d{8,}/.test(label)?'Conversa privada':text(label,120),agent:item.agentId,channel:'Ravi',activityLabel:'',source:'Ravi · metadados de sessões'});
   }
   if(seen.size>2000)throw Error('INVENTORY_LIMIT');
   offset+=items.length;
   if(!p.hasMore){if(offset!==total)throw Error('INCOMPLETE_INVENTORY');return rows;}
   if(!items.length||offset>=total||p.nextOffset!==offset)throw Error('INCOMPLETE_INVENTORY');
   continue;
  }
  if(typeof raw!=='string')throw Error('SESSION_METADATA_CONTRACT_CHANGED');
  const header=raw.match(/All sessions \((\d+) returned of (\d+), limit 10, offset (\d+)\)/);
  if(!header)throw Error('SESSION_METADATA_CONTRACT_CHANGED');
  const [count,current,currentOffset]=header.slice(1).map(Number);total??=current;
  if(total!==current||currentOffset!==offset)throw Error('UNSTABLE_INVENTORY');
  const lines=raw.split('\n').filter(l=>/^\s*\S+\s+\S+\s+\S+\s+.*?\s{2,}(?:permanent|ephemeral)\s/.test(l));
  if(lines.length!==count)throw Error('SESSION_METADATA_CONTRACT_CHANGED');
  for(const line of lines){
   const m=line.match(/^\s*(\S+)\s+(\S+)\s+\S+\s+(.*?)\s{2,}(permanent|ephemeral)\s+(.*)$/);
   if(!m||!identifier(m[1])||!identifier(m[2])||seen.has(m[1]))throw Error('INVALID_SESSION_METADATA');
   seen.add(m[1]);
   // Runtime jobs/evaluations are excluded from this human workspace inventory.
   if(m[4]!=='permanent'||/^(eval|cron|task-)/i.test(m[1]))continue;
   const display=m[5].trim().split(/\s{2,}/).at(-1);
   const label=display&&display!=='-'?display:m[1];
   rows.push({id:m[1],name:/\d{8,}/.test(label)?'Conversa privada':text(label,120),agent:m[2],channel:'Ravi',activityLabel:text(m[3],80),source:'Ravi · metadados de sessões'});
  }
  if(seen.size>2000)throw Error('INVENTORY_LIMIT');
  offset+=count;if(offset===total)return rows;
  if(!count||offset>total)throw Error('INCOMPLETE_INVENTORY');
 }
 throw Error('INVENTORY_LIMIT');
}
export async function discover(days=15,run=command){
 const result={schema:'workspace.inventory/v1',capturedAt:new Date().toISOString(),historyDays:days,coverage:{},agents:[],sessions:[],projects:[],tasks:[]};
 await Promise.all(['agents','sessions','projects','tasks'].map(async kind=>{
  try{
   const rows=kind==='sessions'?await sessionRows(run):await nativeRows(kind,days,run);
   result[kind]=kind==='sessions'?rows:rows.map(r=>kind==='agents'?{id:r.id,name:text(r.name||r.id,120),role:'Agente Ravi',source:'Ravi · cadastro de agentes'}:kind==='projects'?{id:r.id,title:text(r.title,180),status:text(r.status,40),summary:text(r.summary),next:text(r.nextStep),owner:identifier(r.ownerAgentId)?r.ownerAgentId:'',updatedAt:r.updatedAt??null}:{id:r.id,title:text(r.title,180),status:text(r.status,40),priority:text(r.priority,40),updatedAt:r.updatedAt??null,deadline:null});
   result.coverage[kind]={status:'ready',count:result[kind].length,scope:kind==='tasks'?'visible-updated-window':'visible-inventory',capturedAt:result.capturedAt};
  }catch(e){result[kind]=[];result.coverage[kind]={status:'unavailable',count:null,error:/^[A-Z_]+$/.test(e.message)?e.message:'SOURCE_UNAVAILABLE',capturedAt:null};}
 }));
 // A session association proves an agent identifier, not full agent profile access.
 for(const s of result.sessions)if(!result.agents.some(a=>a.id===s.agent))result.agents.push({id:s.agent,name:s.agent,role:'Identificado em sessão visível',source:'Ravi · vínculo de sessão; perfil não consultado'});
 return result;
}
