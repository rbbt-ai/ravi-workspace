import {readFile,writeFile,rename,unlink,mkdir,lstat} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {readConfig,validateConfig,exact,SOURCES} from './config.mjs';
import {emptyPresentation,projectSnapshot} from './snapshot.mjs';
import {discover} from './native.mjs';
import {calendar,meetings} from './providers.mjs';
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const errorCode=e=>/^[A-Z_]+$/.test(e?.message)?e.message:'SOURCE_UNAVAILABLE';
export const snapshotPath=file=>resolve(file)+'.snapshot.json';
export async function readSnapshot(file){try{return JSON.parse(await readFile(snapshotPath(file),'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw Error('INVALID_SNAPSHOT_FILE');}}
export async function atomic(file,value){
 const target=resolve(file),temp=target+'.'+randomUUID()+'.tmp';
 await mkdir(dirname(target),{recursive:true,mode:0o700});
 try{if((await lstat(target)).isSymbolicLink())throw Error('SYMLINK_NOT_ALLOWED');}catch(e){if(e.code!=='ENOENT')throw e;}
 try{await writeFile(temp,JSON.stringify(value,null,2)+'\n',{flag:'wx',mode:0o600});await rename(temp,target);}finally{await unlink(temp).catch(e=>{if(e.code!=='ENOENT')throw e;});}
}
export async function locked(file,fn){
 const lock=resolve(file)+'.setup.lock';await mkdir(dirname(lock),{recursive:true});
 try{await writeFile(lock,'busy',{flag:'wx',mode:0o600});}catch(e){if(e.code==='EEXIST')throw Error('SETUP_BUSY');throw e;}
 try{return await fn();}finally{await unlink(lock);}
}
export function setupView(config,inventory,snapshot){
 const projection=projectSnapshot(snapshot,config);
 return {schema:'workspace.setup/v1',revision:digest(config),installationId:config.installationId,
  workspaceName:config.workspaceName,ownerName:config.owner.name,timezone:config.timezone,historyDays:config.historyDays,
  allowedOrigins:config.allowedOrigins,defaultTheme:config.defaultTheme,widgets:config.widgets,sources:config.sources,selection:config.selection,integrations:config.integrations,
  inventory,states:projection.sourceStates,mode:'local',selectionIsPermission:false};
}
export function configure(current,input,inventory){
 exact(input,['revision','workspaceName','ownerName','timezone','historyDays','defaultTheme','widgets','sources','selection','integrations','allowedOrigins'],'SETUP_INPUT');
 if(input.revision!==digest(current))throw Error('CONFIG_CHANGED');
 if(!inventory||Date.now()-Date.parse(inventory.capturedAt)>300000)throw Error('INVENTORY_EXPIRED');
 const next=validateConfig({...current,...Object.fromEntries(['workspaceName','timezone','historyDays','defaultTheme','widgets','sources','selection','integrations','allowedOrigins'].filter(k=>input[k]!==undefined).map(k=>[k,input[k]])),owner:{...current.owner,name:input.ownerName??current.owner.name}});
 for(const [key,kind] of [['agents','agents'],['sessions','sessions'],['projects','projects'],['tasks','tasks']]){
  const allowed=new Set([...(inventory[kind]||[]).map(r=>r.id),...current.selection[key]]);
  if(next.selection[key].some(id=>!allowed.has(id)))throw Error('UNOBSERVED_SELECTION');
 }
 // Do not let the setup endpoint expand unrelated snapshot selections.
 for(const key of ['alertAgents','sources','work'])if(next.selection[key].some(id=>!current.selection[key].includes(id)))throw Error('UNOBSERVED_SELECTION');
 for(const session of inventory.sessions)if(next.selection.sessions.includes(session.id)&&!next.selection.agents.includes(session.agent))throw Error('SESSION_AGENT_REQUIRED');
 return next;
}
export async function saveSetup(file,input,inventory){return locked(file,async()=>{
 const current=await readConfig(file),next=configure(current,input,inventory),snapshot=await readSnapshot(file);
 if(snapshot?.presentation?.home?.feeds?.agenda?.status==='ready'&&current.integrations.agenda.account!==next.integrations.agenda.account)throw Error('SOURCE_CHANGE_REQUIRES_REVIEW');
 projectSnapshot(snapshot,next);
 await atomic(file,next);return {status:'saved',revision:digest(next),sourcesVerified:false};
});}
export async function collect(file,{inventoryLoader=discover,calendarLoader=calendar,meetingsLoader=meetings,sources,verify=async()=>{}}={}){return locked(file,async()=>{
 const config=await readConfig(file),previous=await readSnapshot(file),now=new Date().toISOString();
 await verify();const selected=config.sources.filter(n=>!sources||sources.includes(n));
 const data=projectSnapshot(previous,config);
 const inventory=selected.some(n=>['projects','tasks','agents'].includes(n))?await inventoryLoader(config.historyDays,undefined,{kinds:[...selected.filter(n=>['projects','tasks','agents'].includes(n)),...(selected.includes('agents')?['sessions']:[])]}):{capturedAt:now,historyDays:config.historyDays,agents:[],sessions:[],projects:[],tasks:[],coverage:{}};
 const state=structuredClone(data.sourceStates),results={};
 const available=(name,fn)=>{try{fn();state[name]={status:'ready',capturedAt:now};results[name]={status:'ready'};}catch(e){state[name]={status:state[name]?.capturedAt?'stale':'unavailable',capturedAt:state[name]?.capturedAt??null,error:errorCode(e)};results[name]={status:state[name].status,error:errorCode(e)};}};
 for(const name of ['projects','tasks','agents'])if(selected.includes(name))available(name,()=>{
  if(inventory.coverage[name].status!=='ready'&&!(name==='agents'&&inventory.coverage.sessions.status==='ready'))throw Error('SOURCE_UNAVAILABLE');
  if(name==='agents'){
   if(inventory.coverage.sessions.status!=='ready'&&config.selection.sessions.length)throw Error('SESSION_INVENTORY_UNAVAILABLE');
   data.agents=inventory.agents;data.sessions=inventory.sessions;data.inventory={capturedAt:inventory.capturedAt,capturedLabel:'Metadados consultados em '+inventory.capturedAt,selectionDays:config.historyDays,coverage:'visible-inventory',refresh:'manual'};
  }else data.home[name]=inventory[name];
 });
 for(const [name,mode,loader] of [['agenda','google-workspace',calendarLoader],['meetings','tldv',meetingsLoader]])if(selected.includes(name)){
  try{if(config.integrations[name].mode!==mode)throw Error('SOURCE_NOT_CONFIGURED');const feed=await loader(config);
   // Provider reads return only display fields. Validate before replacing valid data.
   const candidate=structuredClone(data);candidate.home.feeds[name]=feed;
   projectSnapshot({schema:'workspace.snapshot/v1',installationId:config.installationId,capturedAt:now,presentation:strip(candidate),sourceStates:{...state,[name]:{status:'ready',capturedAt:feed.capturedAt}}},config);
   data.home.feeds[name]=feed;state[name]={status:'ready',capturedAt:feed.capturedAt};results[name]={status:'ready',count:feed.items.length};
  }catch(e){state[name]={status:state[name]?.capturedAt?'stale':'unavailable',capturedAt:state[name]?.capturedAt??null,error:errorCode(e)};results[name]={status:state[name].status,error:errorCode(e)};}
 }
 for(const name of selected.filter(n=>!['agents','projects','tasks','agenda','meetings','connections'].includes(n))){
  // Imported evidence keeps its actual collection/synthesis dates. A refresh is
  // never reported as a new collection of these optional sources.
  state[name]={...state[name],status:state[name].capturedAt?'stale':'unavailable',error:'NO_AUTOMATIC_ADAPTER'};results[name]={status:state[name].status,error:'NO_AUTOMATIC_ADAPTER'};
 }
 if(selected.includes('connections')){
  data.connectors.items=['agenda','meetings'].filter(n=>config.sources.includes(n)).map(n=>({id:n,name:n==='agenda'?'Google Calendar':'tl;dv',feed:n,account:n==='agenda'?config.integrations.agenda.account:'Titular não verificado pela API',accountVerified:n==='agenda'&&state[n].status==='ready',method:'Integração existente no Ravi',purpose:n==='agenda'?'Agenda do dia':'Reuniões transcritas',observedAccess:state[n].status==='ready'?['Leitura confirmada nesta coleta']:[],permissionNote:'Seleção local não concede acesso. A autorização é verificada na consulta.',manageUrl:n==='agenda'?'https://myaccount.google.com/connections':'https://tldv.io/app/settings',helpUrl:'',instructions:'Gerencie consentimento ou chave no provedor. Nenhuma conta é alterada pelo Workspace.'}));
  // Controls are links only; the account value is never a secret.
  data.connectors.items.forEach(c=>{if(!config.allowedOrigins.includes(new URL(c.manageUrl).origin))c.manageUrl='';});
  state.connections={status:'ready',capturedAt:now};results.connections={status:'ready'};
 }
 const candidate={schema:'workspace.snapshot/v1',installationId:config.installationId,capturedAt:now,presentation:strip(data),sourceStates:state};
 const sanitized=projectSnapshot(candidate,config);candidate.presentation=strip(sanitized);
 for(const name of ['agents','projects','tasks'])if(results[name]?.status==='ready')results[name].count=name==='agents'?sanitized.agents.length:sanitized.home[name].length;
 await verify();await atomic(snapshotPath(file),candidate);
 return {status:Object.values(results).some(r=>r.status==='ready')?'collected':'unavailable',capturedAt:now,results,inventory};
});}
function strip(data){const {sourceStates,...presentation}=data;return presentation;}
export async function importSnapshot(file,raw){return locked(file,async()=>{
 const config=await readConfig(file),current=await readSnapshot(file);const validated=projectSnapshot(raw,config);
 // Explicit import replaces a presentation snapshot, never grants/configuration.
 if(current&&Date.parse(raw.capturedAt)<Date.parse(current.capturedAt))throw Error('OLDER_SNAPSHOT');
 const next={schema:'workspace.snapshot/v1',installationId:config.installationId,capturedAt:raw.capturedAt,presentation:strip(validated),sourceStates:validated.sourceStates};
 await atomic(snapshotPath(file),next);return {status:'imported',capturedAt:raw.capturedAt};
});}
