import {readFile,stat,realpath} from 'node:fs/promises';
import {command,discover} from './native.mjs';
import {createHash} from 'node:crypto';

export const hash=v=>createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
export const code=e=>/^[A-Z_]+$/.test(e?.message)?e.message:'SOURCE_UNAVAILABLE';
export function clean(v,max=1600){
 const s=typeof v==='string'?v:'';
 if(/(?:rctx_|gh[pousr]_|github_pat_|sk-)[A-Za-z0-9_-]{16,}|-----BEGIN .*PRIVATE KEY-----/.test(s))throw Error('SENSITIVE_SOURCE_CONTENT');
 return s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').slice(0,max);
}
export const date=v=>{const n=typeof v==='number'?v:Date.parse(v);return Number.isFinite(n)?new Date(n).toISOString():null;};
export async function pages(args,run=command){
 const out=[],ids=new Set();let total,offset=0;const started=Date.now();
 for(let n=0;n<150;n++){
  if(Date.now()-started>60000)throw Error('CATALOG_TIME_LIMIT');
  const raw=await run([...args,'--limit',args[0]==='artifacts'?'200':'50','--offset',String(offset),'--json']),p=raw.pagination,items=raw.items??raw.connections;
  if(!p||!Array.isArray(items)||p.offset!==offset||p.returned!==items.length||!Number.isInteger(p.total)||p.total<0)throw Error('INCOMPLETE_CATALOG');
  total??=p.total;if(total!==p.total)throw Error('UNSTABLE_INVENTORY');
  for(const x of items){if(typeof x.id!=='string'||ids.has(x.id))throw Error('INCOMPLETE_CATALOG');ids.add(x.id);out.push(x);}
  offset+=items.length;if(offset===total)return out;
  if(!items.length||offset>total||p.hasMore===false)throw Error('INCOMPLETE_CATALOG');
 }
 throw Error('INVENTORY_LIMIT');
}
export async function account(run=command){
 const r=await run(['whoami','--json']),s=r.session;
 if(!r.authenticated||!s?.user?.id||!s.organization?.id||s.consoleUrl!=='https://console.ravi.bot')throw Error('CONSOLE_LOGIN_REQUIRED');
 return {userId:clean(s.user.id,160),name:clean(s.user.name,100),email:clean(s.user.email,200),organization:{id:clean(s.organization.id,160),name:clean(s.organization.name||s.organization.slug,120)},consoleUrl:s.consoleUrl};
}
export async function sameAccount(binding,run=command){const a=await account(run);if(a.userId!==binding.userId||a.organization.id!==binding.organizationId)throw Error('ORGANIZATION_CHANGED');return a;}
const row=(kind,id,title,more={})=>({id:kind+':'+id,kind,title:clean(title,200)||'Sem título',...more});
export async function catalog(days=15,run=command){
 const out={capturedAt:new Date().toISOString(),account:null,containers:[],artifacts:[],connections:[],native:null,coverage:{}};
 const attempt=async(k,fn)=>{try{await fn();out.coverage[k]={status:'ready'};}catch(e){out.coverage[k]={status:'unavailable',error:code(e)};}};
 await Promise.all([attempt('console',async()=>{out.account=await account(run);out.containers=(await pages(['cloud','projects','list'],run)).filter(p=>p.orgId===out.account.organization.id).map(p=>({id:p.id,name:clean(p.name||p.slug,200)}));}),
 attempt('native',async()=>{out.native=await contextInventory(days,run);}),
 // The local ledger is a separate permission domain. Metadata is offered for
 // explicit selection, never silently labelled as belonging to a Console org.
 attempt('artifacts',async()=>{out.artifacts=(await pages(['artifacts','list','--rich'],run)).map(a=>row('artifact',a.id,a.label||a.title,{summary:clean(a.summary),updatedAt:date(a.updatedAt),scope:'local-selection',mediaType:clean(a.mimeType,100)}));}),
 attempt('connections',async()=>{out.connections=(await pages(['connectors','list'],run)).filter(c=>c.provider==='google'||c.providerId==='google').map(c=>({id:c.id,name:clean(c.displayName||c.name||c.externalAccountLogin||'Google',200),status:clean(c.status,40)}));})]);
 return out;
}
export async function orgPages(binding,run=command){
 await sameAccount(binding,run);const available=await pages(['cloud','projects','list'],run),out=[];
 for(const id of binding.containers){
  if(!available.some(p=>p.id===id&&p.orgId===binding.organizationId))throw Error('UNOBSERVED_SELECTION');
  const rows=await pages(['pages','published',id],run);
  for(const p of rows){if(p.projectId!==id)throw Error('ORGANIZATION_CHANGED');
   out.push(row('page',p.siteId+':'+(p.artifactId||p.id),p.title||p.artifactName||p.siteSlug,{summary:clean(p.description||p.artifactDescription),updatedAt:date(p.updatedAt),url:(p.urls||[]).find(u=>/^https:\/\/[^/]+\.ravi\.page\//.test(u))||'',version:clean(String(p.artifactVersionId||p.id),160),scope:'organization'}));
  }
 }
 await sameAccount(binding,run);
 // Releases of one artifact are versions, not business initiatives.
 return [...new Map(out.sort((a,b)=>(Date.parse(a.updatedAt)||0)-(Date.parse(b.updatedAt)||0)).map(x=>[x.id,x])).values()];
}
function excerpt(text,max=1600){
 const s=clean(text,200000).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
 if(s.length<=max)return s;
 return [s.slice(0,500),s.slice(Math.max(0,Math.floor(s.length/2)-250),Math.floor(s.length/2)+250),s.slice(-500)].join(' […] ');
}
export async function artifactEvidence(id,run=command){
 const raw=await run(['artifacts','show',id,'--json']),a=raw.artifact;
 if(!a||a.id!==id)throw Error('SOURCE_CONTRACT_CHANGED');
 let text=clean(a.summary),sampled=false;
 // Only a blob returned by the authorized ledger command. Never accept an
 // arbitrary file path or URL from the browser or execute artifact content.
 if(a.blobPath&&(/^(text\/|application\/json)/.test(a.mimeType||'')||/\.(?:html?|md|txt|json)$/i.test(a.filePath||a.blobPath))){
  const file=await realpath(a.blobPath),s=await stat(file);
  if(!s.isFile()||s.size>1000000)throw Error('ARTIFACT_TOO_LARGE');
  text=excerpt(await readFile(file,'utf8'));sampled=true;
 }
 return row('artifact',id,a.label||a.title,{text,sourceAt:date(a.updatedAt||a.createdAt),level:sampled?'content-sample':'metadata',limitation:sampled?'Amostra do início, meio e fim; não é leitura integral.':'Somente metadados; conteúdo não disponível neste formato.'});
}
export async function gmailEvidence(binding,days,run=command){
 if(!binding.connectorId)return [];
 const r=await run(['connectors','show',binding.connectorId,'--json']),c=r.connection;
 if(!c||c.id!==binding.connectorId||c.status!=='active'||c.requiresReauth)throw Error('GMAIL_CONNECTION_UNAVAILABLE');
 if(c.externalAccountLogin?.toLowerCase()!==binding.account.toLowerCase())throw Error('GMAIL_ACCOUNT_MISMATCH');
 if(!c.capabilities?.includes('gmail.message.read')||!c.capabilities?.includes('gmail.message.list'))throw Error('GMAIL_READ_SCOPE_REQUIRED');
 const result=[],seen=new Set(),since=Math.floor((Date.now()-days*86400000)/1000);let cursor=null;
 for(let page=0;page<4;page++){
  const raw=await run(['gmail','list','--connector',binding.connectorId,'--max','20','--q',`after:${since} -in:trash -in:spam ${binding.query||''}`,...(binding.labels.length?['--label',binding.labels.join(',')]:[]),...(cursor?['--cursor',cursor]:[]),'--json']);
  const list=raw.result;if(!list||!Array.isArray(list.messages??[]))throw Error('SOURCE_CONTRACT_CHANGED');
  for(const m of list.messages||[]){if(seen.has(m.id))continue;seen.add(m.id);
   const {result:v}=await run(['gmail','read',m.id,'--connector',binding.connectorId,'--format','full','--json']);
   if(!v||v.id!==m.id)throw Error('SOURCE_CONTRACT_CHANGED');
   const at=date(Number(v.internalDate)||v.headers?.date);if(!at||Date.parse(at)<since*1000)continue;
   result.push(row('gmail',binding.connectorId+':'+m.id,v.headers?.subject,{thread:clean(m.threadId,160),sourceAt:at,text:excerpt(v.body?.text||v.snippet||''),level:'content-sample',limitation:'Trecho do e-mail; anexos não lidos. Mensagens não são marcadas como lidas.',url:'https://mail.google.com/mail/u/'+encodeURIComponent(binding.account)+'/#all/'+encodeURIComponent(m.threadId)}));
  }
  if(!list.nextPageToken)return {items:result,complete:true};
  if(cursor===list.nextPageToken)throw Error('INCOMPLETE_CATALOG');cursor=list.nextPageToken;
 }
 return {items:result,complete:false};
}
export async function conversationEvidence(id,days,run=command){
 const raw=await run(['sessions','read',id,'--workspace','-n','30','--json']);
 const list=raw.messages??raw.history?.messages;
 if(!Array.isArray(list))throw Error('SESSION_CONTENT_UNAVAILABLE');
 const since=Date.now()-days*86400000;
 return list.flatMap(m=>{
  const at=date(m.timestamp??m.createdAt??m.at),text=typeof m.content==='string'?m.content:typeof m.text==='string'?m.text:'';
  if(!at||Date.parse(at)<since||!text||/^\[Cron:|^\[System\]/.test(text))return [];
  return [row('message',id+':'+(m.id||hash([at,text]).slice(0,24)),clean(raw.session?.displayName||raw.session?.name||id,120),{sourceAt:at,text:excerpt(text.replace(/^\[session surfaces\].*(?:\n|$)/gm,'').replace(/\[WhatsApp [^\]]*\]\s*[^:\n]{1,100}:/g,'')),role:m.role==='user'?'request':'report',level:'content-sample',sessionId:id,limitation:'Amostra de até 30 mensagens normalizadas, filtrada pela janela selecionada.'})];
 });
}

export async function contextInventory(days,run=command){
 const started=Date.now();
 const bounded=async(args,options)=>{if(Date.now()-started>45000)throw Error('CATALOG_TIME_LIMIT');return run(args,options);};
 return discover(days,bounded);
}
