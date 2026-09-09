import {SOURCES,exact} from './config.mjs';
import {validatePresentation} from './presentation.mjs';
const pick=(v,keys)=>Object.fromEntries(keys.filter(k=>v[k]!==undefined).map(k=>[k,v[k]]));
const array=v=>Array.isArray(v)?v:[];
const iso=v=>typeof v==='string'&&/T.*(?:Z|[+-]\d\d:\d\d)$/.test(v)&&Number.isFinite(Date.parse(v));
const select=(rows,ids)=>array(rows).filter(r=>ids.includes(r.id));
const safeString=s=>typeof s==='string'&&s.length<=16000;
function scan(value,depth=0){
 if(depth>14)throw Error('SNAPSHOT_TOO_DEEP');
 if(typeof value==='string'){if(value.length>16000||/rctx_[A-Za-z0-9_-]{12,}/.test(value))throw Error('UNSAFE_SNAPSHOT_CONTENT');return;}
 if(Array.isArray(value)){if(value.length>5000)throw Error('SNAPSHOT_TOO_LARGE');value.forEach(v=>scan(v,depth+1));return;}
 if(value&&typeof value==='object')for(const [k,v]of Object.entries(value)){if(/^(apiKey|clientSecret|refreshToken|accessToken|credentials?|password|secret|contextKey|transcript|rawTranscript|rawMessages|prompt|command|shell|exec|routing|destination|contact|provenance|__proto__|constructor|prototype)$/i.test(k))throw Error('PRIVATE_FIELD_NOT_ALLOWED');scan(v,depth+1);}
}
function checkedRows(rows,required,label){if(!Array.isArray(rows)||rows.length>3000)throw Error('INVALID_'+label);const seen=new Set();for(const row of rows){if(!row||typeof row!=='object'||required.some(k=>!safeString(row[k]))||!row.id||seen.has(row.id))throw Error('INVALID_'+label);seen.add(row.id);}return rows;}
const labels={agenda:'Agenda do dia',meetings:'Reuniões transcritas',pipeline:'Pipeline de clientes',projects:'Projetos',tasks:'Tarefas',agents:'Agentes',alerts:'Alerts',activity:'Atividade',connections:'Conexões',projectAnalysis:'Análise de projetos'};
export function emptyPresentation(c){
 const missing=name=>({status:'not_configured',source:labels[name],title:labels[name],reason:'Fonte não configurada nesta instalação.',text:'Escolha uma fonte e valide o acesso no seu Ravi.',capturedAt:null,description:'',limit:'Nenhuma consulta realizada.',items:[],url:''});
 return {agents:[],sessions:[],sources:[],work:[],events:[],inventory:{capturedAt:null,capturedLabel:'Inventário não consultado',selectionDays:c.historyDays,coverage:'not_configured',refresh:'not_configured'},home:{capturedAt:null,projects:[],tasks:[],feeds:Object.fromEntries(['agenda','meetings','pipeline'].map(n=>[n,missing(n)]))},alerts:{schemaVersion:1,capturedAt:null,displayTimezone:c.timezone,coverage:{status:'partial',reason:'not_configured',requestedScope:'installation-selection',paginationComplete:false,visibleCount:0},items:[]},projectContext:{schemaVersion:1,analyzedAt:null,window:{from:null,through:null},coverage:{sessions:0,messagesInWindow:0,maxReadPerStore:0,synthesizedProjects:0,description:'Análise ainda não configurada nesta instalação.'},projects:[]},activity:null,connectors:{schemaVersion:1,items:[]},connectionSources:null,sourceStates:Object.fromEntries(SOURCES.map(n=>[n,{status:c.sources.includes(n)?'unavailable':'not_configured',capturedAt:null}]))};
}
export function projectSnapshot(raw,c){
 const data=emptyPresentation(c);if(raw==null)return data;
 exact(raw,['schema','installationId','capturedAt','presentation','sourceStates'],'SNAPSHOT');
 if(raw.schema!=='workspace.snapshot/v1'||raw.installationId!==c.installationId)throw Error('SNAPSHOT_INSTALLATION_MISMATCH');
 if(!iso(raw.capturedAt))throw Error('INVALID_CAPTURE_DATE');
 scan(raw);const p=raw.presentation;exact(p,['agents','sessions','sources','work','events','inventory','home','alerts','projectContext','activity','connectors','connectionSources'],'PRESENTATION');
 const enabled=n=>c.sources.includes(n), sel=c.selection;
 for(const [name,state] of Object.entries(raw.sourceStates||{})){if(!SOURCES.includes(name))throw Error('INVALID_SOURCE_STATE');exact(state,['status','capturedAt','error'],'SOURCE_STATE');if(!['ready','unavailable','not_configured','stale'].includes(state.status)||(state.capturedAt!==null&&!iso(state.capturedAt)))throw Error('INVALID_SOURCE_STATE');if(enabled(name))data.sourceStates[name]=state;}
 if(enabled('agents')){
  data.agents=select(checkedRows(p.agents||[],['id','name'],'AGENTS'),sel.agents).map(a=>({...pick(a,['id','name','role','source']),execution:null}));
  data.sessions=select(checkedRows(p.sessions||[],['id','name','agent'],'SESSIONS'),sel.sessions).filter(s=>data.agents.some(a=>a.id===s.agent)).map(s=>({...pick(s,['id','name','agent','channel','activityLabel','source']),execution:null}));
  if(p.inventory)data.inventory={...data.inventory,...pick(p.inventory,['capturedAt','capturedLabel','selectionDays','coverage','refresh'])};
 }
 if(p.home){exact(p.home,['capturedAt','label','projects','tasks','feeds'],'HOME');data.home.capturedAt=p.home.capturedAt??null;
  if(enabled('projects'))data.home.projects=select(checkedRows(p.home.projects||[],['id','title'],'PROJECTS'),sel.projects).map(p=>pick(p,['id','title','status','summary','next','owner','updatedAt']));
  if(enabled('tasks'))data.home.tasks=select(checkedRows(p.home.tasks||[],['id','title'],'TASKS'),sel.tasks).map(t=>pick(t,['id','title','status','priority','updatedAt','deadline']));
  for(const name of ['agenda','meetings','pipeline']){if(!enabled(name)||!p.home.feeds?.[name])continue;const f=p.home.feeds[name];
   if(f.status!=='ready'){data.home.feeds[name]={...data.home.feeds[name],status:'unavailable',reason:'A última leitura não confirmou esta fonte.'};continue;}
   if(!iso(f.capturedAt))throw Error('INVALID_FEED_DATE');checkedRows(f.items,['id','title'],'FEED');
   const fields=name==='agenda'?['id','title','start','end','allDay','response','url']:name==='meetings'?['id','title','happenedAt','segments','url','analysis']:['id','title','short','group','status','owner','summary','next','checked'];
   data.home.feeds[name]={...data.home.feeds[name],...pick(f,['status','source','capturedAt','date','timezone','from','through','url','description','limit','sourceCheckedAt']),items:f.items.map(item=>pick(item,fields))};
   if(name==='meetings')for(const m of data.home.feeds[name].items)if(m.analysis){const a=m.analysis;exact(a,['state','theme','preview','topics','sampledAt','synthesizedAt','windowCount','sampledSegments','totalSegments','limitation','evidence','method','transcriptHash','sampleHash','fingerprint','meetingId','version'],'MEETING_ANALYSIS');if(!['reviewed','insufficient'].includes(a.state)||a.preview?.length>1600)throw Error('INVALID_MEETING_ANALYSIS');}
  }
 }
 if(enabled('alerts')&&p.alerts){data.alerts={...data.alerts,...pick(p.alerts,['capturedAt','coverage'])};data.alerts.items=checkedRows(p.alerts.items||[],['id','agentKey','agentName','name'],'ALERTS').filter(a=>sel.alertAgents.includes(a.agentKey)).map(a=>pick(a,['id','agentKey','agentName','name','enabled','schedule','nextRunAt','lastRunAt','lastStatus','executionType','deleteAfterRun']));data.alerts.coverage={...data.alerts.coverage,requestedScope:'installation-selection',visibleCount:data.alerts.items.length};}
 if(enabled('projectAnalysis')&&p.projectContext){data.projectContext={...data.projectContext,...pick(p.projectContext,['schemaVersion','analyzedAt','window','coverage']),projects:select(p.projectContext.projects,sel.projects).map(p=>pick(p,['id','nativeId','title','association','summary','stage','next','nextKind','lastActivityAt','agents','gaps','evidence','reviewedAt','basis']))};}
 if(enabled('activity')&&p.activity){const a=p.activity;if(a.schemaVersion!==1||a.status!=='ready'||!iso(a.capturedAt))throw Error('INVALID_ACTIVITY');data.activity={...pick(a,['status','schemaVersion','capturedAt','window','sources']),sessions:select(a.sessions,sel.sessions).filter(s=>sel.agents.includes(s.agent)).map(s=>pick(s,['id','agent','name','state','observedAt','validUntil','executionId','reason','evidenceId'])),tasks:select(a.tasks,sel.tasks).map(t=>({...pick(t,['id','title','state','priority','progress','updatedAt','lastUpdate','blocker','result','historyComplete','executionAssociation']),roles:array(t.roles).filter(r=>sel.agents.includes(r.agent)),events:array(t.events).map(e=>({...e,agent:sel.agents.includes(e.agent)?e.agent:null}))}))};}
 if(enabled('connections')&&p.connectors){data.connectors.items=array(p.connectors.items).filter(c=>enabled(c.feed)&&['agenda','meetings'].includes(c.feed)).map(c=>pick(c,['id','name','feed','account','accountVerified','method','purpose','observedAccess','permissionNote','manageUrl','helpUrl','instructions']));}
 if(enabled('connections')&&p.connectionSources)data.connectionSources=pick(p.connectionSources,['status','project','capturedAt','connections','bindings','collector']);
 data.sources=select(p.sources,sel.sources).map(s=>pick(s,['id','title','kind','date','updated','excerpt','facts','limit']));
 data.work=select(p.work,sel.work).map(w=>pick(w,['id','name','kind','status','description','date','source','next','meaning','facts']));
 data.events=array(p.events).filter(ev=>sel.sources.includes(ev.source)).map(ev=>pick(ev,['time','title','description','source']));
 validatePresentation(data);validateLinks(data,c);
 return data;
}
function validateLinks(v,c,key=''){
 if(typeof v==='string'&&/^(url|manageUrl|helpUrl)$/.test(key)&&v){let u;try{u=new URL(v);}catch{throw Error('INVALID_LINK');}if(u.protocol!=='https:'||u.username||u.password||!c.allowedOrigins.includes(u.origin))throw Error('UNAPPROVED_LINK_ORIGIN');}
 else if(Array.isArray(v))v.forEach(x=>validateLinks(x,c));else if(v&&typeof v==='object')for(const [k,x]of Object.entries(v))validateLinks(x,c,k);
}
