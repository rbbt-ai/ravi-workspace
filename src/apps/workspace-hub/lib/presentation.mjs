// Validate the display contract, not provider payloads. Provider secrets and full
// transcripts must never enter this contract. Dates belong to their source.
const fail=()=>{throw Error('INVALID_PRESENTATION_RECORD');};
const str=(v,max=1600)=>typeof v==='string'&&v.length<=max;
const id=v=>str(v,160)&&/^[a-zA-Z0-9][a-zA-Z0-9_.:-]*$/.test(v);
const date=v=>v===null||v===undefined||Number.isFinite(typeof v==='number'?v:Date.parse(v));
const strings=v=>Array.isArray(v)&&v.length<=100&&v.every(s=>str(s));
function rows(list,keys){if(!Array.isArray(list))fail();for(const r of list){if(!id(r.id)||keys.some(k=>!str(r[k])))fail();}}
const dates=(r,keys)=>{if(keys.some(k=>!date(r[k])))fail();};
export function validatePresentation(d){
 rows(d.agents,['name']);rows(d.sessions,['name','agent']);rows(d.sources,['title','kind']);rows(d.work,['name']);
 for(const s of d.sources)if(!strings(s.facts))fail();
 for(const w of d.work)if(w.facts!==undefined&&!strings(w.facts))fail();
 rows(d.home.projects,['title']);rows(d.home.tasks,['title']);
 for(const r of [...d.home.projects,...d.home.tasks])dates(r,['updatedAt','deadline']);
 for(const name of ['agenda','meetings','pipeline']){const f=d.home.feeds[name];dates(f,['capturedAt','from','through','sourceCheckedAt']);rows(f.items,['title']);
  if(name==='agenda'&&f.status==='ready'&&(!/^\d{4}-\d{2}-\d{2}$/.test(f.date)||!date(f.date)))fail();
  for(const r of f.items){
   if(name==='agenda'){dates(r,['start','end']);if(!r.start||!r.end||Date.parse(r.start)>=Date.parse(r.end)||typeof r.allDay!=='boolean')fail();}
   if(name==='meetings'){
    if(!r.happenedAt||!date(r.happenedAt)||!Number.isInteger(r.segments)||r.segments<1)fail();
    const a=r.analysis;if(a){dates(a,['sampledAt','synthesizedAt']);if(!str(a.limitation)||!a.sampledAt||!a.synthesizedAt||!Number.isInteger(a.windowCount)||a.windowCount<0||!Number.isInteger(a.sampledSegments)||a.sampledSegments<0||!Number.isInteger(a.totalSegments)||a.sampledSegments>a.totalSegments||a.totalSegments>r.segments)fail();
     if(a.state==='reviewed'&&(!str(a.theme,180)||!a.theme||!str(a.preview)||!a.preview||!strings(a.topics)||!a.topics.length))fail();
     if(!Array.isArray(a.evidence)||a.evidence.length>20||a.evidence.some(e=>!Number.isFinite(e.from)||!Number.isFinite(e.to)||e.from<0||e.to<e.from||Object.keys(e).some(k=>!['from','to'].includes(k))))fail();
    }
   }
   if(name==='pipeline'&&(!['active','priority','lead','review'].includes(r.group)||['short','status','owner','summary','next'].some(k=>!str(r[k]))))fail();
  }
 }
 rows(d.alerts.items,['agentKey','agentName','name']);dates(d.alerts,['capturedAt']);
 for(const a of d.alerts.items){if(![true,false,null].includes(a.enabled)||![true,false,null].includes(a.deleteAfterRun)||!['agent','shell'].includes(a.executionType)||![null,'ok','error'].includes(a.lastStatus))fail();dates(a,['nextRunAt','lastRunAt']);const s=a.schedule;if(!s||!['at','every','cron'].includes(s.type)||Object.keys(s).some(k=>!['type','at','every','cron','timezone'].includes(k)))fail();if(s.type==='at'&&!date(s.at))fail();if(s.type==='every'&&(!Number.isFinite(s.every)||s.every<=0))fail();if(s.type==='cron'&&!str(s.cron,100))fail();if(s.timezone)try{new Intl.DateTimeFormat('en',{timeZone:s.timezone});}catch{fail();}}
 rows(d.projectContext.projects,['title','summary','stage','next']);dates(d.projectContext,['analyzedAt']);
 for(const p of d.projectContext.projects){if(!strings(p.agents)||!strings(p.gaps)||!Array.isArray(p.evidence)||!['conversation','documents','registry'].includes(p.basis))fail();dates(p,['lastActivityAt','reviewedAt']);rows(p.evidence,['label','text']);for(const e of p.evidence){dates(e,['at']);if(!['request','conversation','document','catalog','registry'].includes(e.kind))fail();}}
 if(d.activity){const a=d.activity;rows(a.sessions,['agent','name','state']);rows(a.tasks,['title','state']);
  for(const s of a.sessions){dates(s,['observedAt','validUntil']);if(!['running','idle','unknown'].includes(s.state))fail();if(s.state!=='unknown'&&(!s.observedAt||Date.parse(s.observedAt)>Date.now()+5000))fail();}
  for(const t of a.tasks){dates(t,['updatedAt']);if(!['open','dispatched','in_progress','blocked','done','failed','conflicting'].includes(t.state)||!(t.progress===null||t.progress===undefined||Number.isFinite(t.progress)&&t.progress>=0&&t.progress<=100))fail();if(!Array.isArray(t.roles)||t.roles.some(r=>!id(r.agent)||!['assigned','reporter'].includes(r.kind)))fail();rows(t.events,['type']);for(const e of t.events){dates(e,['at']);if(!['task.created','task.dispatched','task.progress','task.blocked','task.done','task.failed'].includes(e.type))fail();}}
 }
 rows(d.connectors.items,['name','feed','account','method','purpose','permissionNote','instructions']);for(const c of d.connectors.items)if(typeof c.accountVerified!=='boolean'||!strings(c.observedAccess))fail();
 if(d.connectionSources){const s=d.connectionSources;if(!Array.isArray(s.connections)||!Array.isArray(s.bindings))fail();for(const b of s.bindings)if(!str(b.feed,50)||!str(b.sourceId,100)||!str(b.mode,100))fail();dates(s,['capturedAt']);}
 return d;
}
