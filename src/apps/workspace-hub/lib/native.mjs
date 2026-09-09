import {execFile} from 'node:child_process';
const identifier=v=>typeof v==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,159}$/.test(v);
const text=(v,n=1600)=>{
 if(typeof v!=='string')return '';
 if(/(?:rctx_|gh[pousr]_|github_pat_|sk-)[A-Za-z0-9_-]{16,}|-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(v))throw Error('SENSITIVE_SOURCE_CONTENT');
 return v.slice(0,n);
};
export function command(args,{json=true}={}){
 return new Promise((resolve,reject)=>execFile('ravi',args,{timeout:25000,maxBuffer:2500000},(error,stdout)=>{
  if(error)return reject(Error('SOURCE_UNAVAILABLE'));
  try{resolve(json?JSON.parse(stdout):stdout);}catch{reject(Error('SOURCE_CONTRACT_CHANGED'));}
 }));
}
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
  if(!p.hasMore)return rows;
  if(!items.length)throw Error('INCOMPLETE_INVENTORY');
  if(kind==='tasks'){if(!p.nextCursor||p.nextCursor===cursor)throw Error('INCOMPLETE_INVENTORY');cursor=p.nextCursor;}
  else{if(p.nextOffset!==offset+items.length)throw Error('INCOMPLETE_INVENTORY');offset=p.nextOffset;}
 }
 throw Error('INVENTORY_LIMIT');
}
// The installed CLI truncates session JSON even at limit 1. This bounded metadata
// table contract is also used by the existing runtime observer. Never read history.
export async function sessionRows(run=command){
 let offset=0,total;const rows=[],seen=new Set();
 for(let page=0;page<20;page++){
  const raw=await run(['sessions','list','--limit','100','--offset',String(offset)],{json:false});
  const header=raw.match(/All sessions \((\d+) returned of (\d+), limit 100, offset (\d+)\)/);
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
