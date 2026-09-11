import {safeSdkError} from './sdk.mjs';

export function updatePlan(config,binding,completed){
 const context=completed&&binding?.autoUpdate?binding:null;
 const feeds=config.sources.filter(x=>['projects','tasks','agents','agenda','meetings','connections'].includes(x));
 const kinds=context?['pages',...context.artifacts.map(id=>'artifact:'+id),'projects','tasks',...context.sessions.map(id=>'session:'+id),'gmail'].filter(k=>k==='pages'?context.containers.length:k==='gmail'?context.gmail.connectorId:k==='projects'||k==='tasks'?context[k].length:true):[];
 const all=[...feeds.map(k=>'feed:'+k),...kinds.map(k=>'context:'+k)],streams=[];
 const tasks=new Set([...(config.sources.includes('tasks')?config.selection.tasks:[]),...(context?.tasks||[])]);
 if(tasks.size)streams.push({subject:'ravi.task.*.event',targets:e=>{const id=/^ravi\.task\.(.+)\.event$/.exec(e.topic)?.[1];return tasks.has(id)?all.filter(k=>k==='feed:tasks'||k==='context:tasks'):[];}});
 if(context?.artifacts.length)streams.push({subject:'ravi.artifacts.*',targets:e=>{const id=e.data?.version===1&&e.data?.eventType==='artifact.lifecycle'?e.data.artifact?.id:null;return context.artifacts.includes(id)?['context:artifact:'+id]:[];}});
 if(feeds.includes('meetings'))streams.push({subject:'ravi.meetings.*',targets:e=>['ravi.meetings.ended','ravi.meetings.transcript_available','ravi.meetings.artifact_generated'].includes(e.topic)?['feed:meetings']:[]});
 // Bound listeners. Remaining selected sessions still participate in resync.
 for(const id of (context?.sessions||[]).slice(0,16))for(const kind of ['prompt','response'])streams.push({subject:`ravi.session.${id}.${kind}`,targets:e=>e.topic===`ravi.session.${id}.${kind}`?['context:session:'+id]:[]});
 return {all,streams,periodicOnly:['Pages','Gmail','Projects','agents','calendar'],sessionStreamLimit:16};
}

export function createUpdates({plan,open,refresh,now=Date.now,debounceMs=1500,minRefreshMs=10000,reconcileMs=900000,loopMs=1000,retryBaseMs=2000,maxRetries=5}){
 let stopped=false,running=false,lastStart=-Infinity,lastFull=now(),lastSuccess=null,revision=0,error=null;
 const dirty=new Set(plan.all),states=new Map(),controllers=new Set();let due=now()+debounceMs;
 function invalidate(keys){for(const k of keys)if(plan.all.includes(k))dirty.add(k);if(dirty.size)due=Math.min(due,now()+debounceMs);}
 async function flush(){
  if(stopped||running||!dirty.size||now()<due||now()-lastStart<minRefreshMs)return;
  const keys=[...dirty];dirty.clear();running=true;lastStart=now();
  try{const r=await refresh(keys);if(stopped)return;revision++;lastSuccess=new Date(now()).toISOString();error=r?.error||null;}
  catch(e){if(e.message==='SETUP_BUSY'){invalidate(keys);return;}error=safeSdkError(e).message;revision++;if(['AUTH_EXPIRED','ACCESS_DENIED'].includes(error))stop();}
  finally{running=false;due=now()+debounceMs;}
 }
 async function listen(spec){
  let failures=0;
  while(!stopped){
   const controller=new AbortController();controllers.add(controller);let sequence=null,openedAt=null;
   states.set(spec.subject,'connecting');
   // A transport rotation rechecks native authorization, not the runtime TTL.
   const rotate=setTimeout(()=>controller.abort(),300000);rotate.unref?.();
   try{
    for await(const event of open(spec.subject,{signal:controller.signal,onOpen(){openedAt=now();states.set(spec.subject,'connected');invalidate(plan.all);}})){
     if(stopped)break;
     const e=event.data;
     if(!e||e.type!=='event'||typeof e.topic!=='string'||e.topic.length>500)throw Error('SOURCE_CONTRACT_CHANGED');
     const id=event.id===undefined?null:Number(event.id);
     if(id!==null){if(!Number.isSafeInteger(id)||id<0)throw Error('SOURCE_CONTRACT_CHANGED');if(sequence!==null&&id<=sequence)continue;if(sequence!==null&&id!==sequence+1)invalidate(plan.all);sequence=id;}
     invalidate(spec.targets(e)); // No payload survives this projection.
    }
    if(stopped)break;states.set(spec.subject,'disconnected');
   }catch(e){
    if(stopped)break;const code=safeSdkError(e).message;states.set(spec.subject,code);
    if(['ACCESS_DENIED','AUTH_EXPIRED','SDK_AUTH_UNAVAILABLE','SDK_OPERATION_UNAVAILABLE'].includes(code))break;
   }finally{clearTimeout(rotate);controller.abort();controllers.delete(controller);}
   if(stopped)break;
   invalidate(plan.all); // Native IDs do not guarantee replay; re-read scope.
   if(openedAt!==null&&now()-openedAt>=30000)failures=0;
   failures++;if(failures>maxRetries){states.set(spec.subject,'reconnect_exhausted');break;}
   const wait=Math.min(30000,retryBaseMs*2**(failures-1));
   await new Promise(resolve=>{const c=new AbortController();controllers.add(c);const finish=()=>{clearTimeout(t);controllers.delete(c);resolve();};const t=setTimeout(finish,wait);c.signal.addEventListener('abort',finish,{once:true});});
  }
 }
 function tick(){if(now()-lastFull>=reconcileMs){lastFull=now();invalidate(plan.all);}return flush();}
 function stop(){stopped=true;clearInterval(timer);for(const c of controllers)c.abort();controllers.clear();}
 const timer=setInterval(()=>void tick(),loopMs);timer.unref?.();
 const workers=plan.streams.map(listen);
 return {invalidate,flush,tick,stop,done:()=>Promise.all(workers),status(){const values=[...states.values()];return {schema:'workspace.updates/v1',revision,status:stopped?'stopped':running?'refreshing':error?'stale':values.some(v=>v!=='connected')?'reconnecting':values.length?'observing':'periodic',lastSuccess,error,connected:values.filter(v=>v==='connected').length,streams:values.length,unavailable:values.filter(v=>['ACCESS_DENIED','AUTH_EXPIRED','SDK_AUTH_UNAVAILABLE','SDK_OPERATION_UNAVAILABLE','reconnect_exhausted'].includes(v)).length,reconcileMs,pending:dirty.size};}};
}
