import {catalog,account} from './context-sources.mjs';
import {contextView,saveDraft,bindContext,collectContext,requestAnalysis,reviewMap,contextMap,contextTick,verifyContextAccount,discardPacket} from './context-engine.mjs';
import {command} from './native.mjs';
import {readFile} from 'node:fs/promises';
import {randomBytes,timingSafeEqual} from 'node:crypto';
import {readConfig} from './config.mjs';
import {renderWorkspace} from './build.mjs';
import {discover} from './native.mjs';
import {dirname,resolve} from 'node:path';
import {readSnapshot,setupView,saveSetup,collect,importSnapshot} from './setup.mjs';
import {hash} from './context-sources.mjs';
import {projectSnapshot} from './snapshot.mjs';
import {createEventStream} from './sdk-events.mjs';
import {createUpdates,updatePlan} from './updates.mjs';
export async function startSetup(configFile,{port=0,inventoryLoader=discover,collectOptions={},contextRun=command,contextCatalogLoader=catalog,eventOpen,updateOptions={}}={}){
 await readConfig(configFile);const nonce=randomBytes(32).toString('hex');let inventory=null,contextInventory=null,busy=false,connectionJob=null;
 let updates=null,scope=null,stopped=false,polling=false;
 const scopeHash=(config,state)=>hash([config,state.binding,state.completed]);
 const stopUpdates=()=>{updates?.stop();updates=null;scope=null;};
 async function updateView(payload){
  if(polling)return {status:{status:'refreshing'}};polling=true;
  try{
   const state=await verifyContextAccount(configFile,contextRun),config=await readConfig(configFile),current=scopeHash(config,state);
   if(scope!==current){
    stopUpdates();scope=current;
    let open=eventOpen;
    if(!open)try{open=createEventStream();}catch{open=async function*(){throw Error('SDK_AUTH_UNAVAILABLE');};}
    const plan=updatePlan(config,state.binding,state.completed);
    const verify=async()=>{const next=await verifyContextAccount(configFile,contextRun);if(stopped||scopeHash(await readConfig(configFile),next)!==current)throw Error('CONFIG_CHANGED');};
    updates=createUpdates({...updateOptions,plan,open,async refresh(keys){
     if(busy)throw Error('SETUP_BUSY');await verify();
     const feeds=keys.filter(k=>k.startsWith('feed:')).map(k=>k.slice(5));
     let error=null;
     if(feeds.length){const r=await collect(configFile,{inventoryLoader,...collectOptions,sources:feeds,verify});if(Object.values(r.results).some(v=>v.error))error='SOURCE_UNAVAILABLE';}
     const kinds=keys.filter(k=>k.startsWith('context:')).map(k=>k.slice(8));
     if(kinds.length){const r=await contextTick(configFile,{run:contextRun,kinds,force:true,verify});if(r.status==='source_error')error='SOURCE_UNAVAILABLE';}
     await verify();return {error};
    }});
   }
   const snapshot=await readSnapshot(configFile),data=projectSnapshot(snapshot,config),map=await contextMap(configFile,{run:contextRun});
   if(map)data.contextMap=map;
   await verifyContextAccount(configFile,contextRun);
   if(current!==scopeHash(await readConfig(configFile),await contextView(configFile)))throw Error('CONFIG_CHANGED');
   const revision=hash([current,data]);
   return {status:updates.status(),revision,...(revision!==payload.revision?{data,installationId:config.installationId}:{})};
  }catch(e){stopUpdates();throw e;}finally{polling=false;}
 }
 const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY'};
 const json=(body,status=200)=>Response.json(body,{status,headers});
 const server=Bun.serve({hostname:'127.0.0.1',port,maxRequestBodySize:1000000,async fetch(request){
  const url=new URL(request.url),expected=`http://127.0.0.1:${server.port}`;
  if(url.origin!==expected||request.headers.get('host')!==new URL(expected).host)return json({error:'HOST_REJECTED'},403);
  try{
   if(request.method==='GET'&&url.pathname==='/'){
    let authorized=true;try{await verifyContextAccount(configFile,contextRun);}catch{authorized=false;}
    const context=await contextView(configFile);
    const config=await readConfig(configFile),snapshot=authorized?await readSnapshot(configFile):null,rendered=await renderWorkspace(config,snapshot,dirname(resolve(configFile)),authorized?await contextMap(configFile):null);
    const ui=new URL('../ui/workspace/',import.meta.url),css=await readFile(new URL('setup.css',ui),'utf8'),script=await readFile(new URL('setup.js',ui),'utf8');
    const guideCSS=await readFile(new URL('guide.css',ui),'utf8'),guideJS=await readFile(new URL('guide.js',ui),'utf8'),updatesJS=await readFile(new URL('updates.js',ui),'utf8');
    const bootstrap={installationId:config.installationId,guided:true,firstRun:!authorized||(config.sources.length===0&&!context.completed),needsCollection:config.sources.length>0&&!snapshot};
    const html=rendered.html.replace("connect-src 'none'","connect-src 'self'").replace('</head>',`<style>${css}\n${guideCSS}</style></head>`).replace('</body>',`<script>window.workspaceSetupNonce=${JSON.stringify(nonce)};window.workspaceSetupBootstrap=${JSON.stringify(bootstrap).replace(/</g,'\\u003c')};</script><script>${script}</script><script>${guideJS}</script><script>${updatesJS}</script></body>`);
    return new Response(html,{headers:{...headers,'Content-Type':'text/html; charset=utf-8'}});
   }
   if(request.method!=='POST')return json({error:'NOT_FOUND'},404);
   const supplied=request.headers.get('x-workspace-setup')||'';
   if(request.headers.get('origin')!==expected||request.headers.get('content-type')!=='application/json'||supplied.length!==nonce.length||!timingSafeEqual(Buffer.from(supplied),Buffer.from(nonce)))return json({error:'REQUEST_REJECTED'},403);
   if(url.pathname==='/updates')return json(await updateView(await request.json()));
   if(url.pathname.startsWith('/context/')){
    const payload=await request.json(),action=url.pathname.slice(9);
    if(action==='view'){const v=await contextView(configFile);try{await verifyContextAccount(configFile,contextRun);return json({...v,connectionJob});}catch{return json({revision:v.revision,binding:null,draft:null,projects:[],coverage:{},collectedAt:null,synthesizedAt:null,completed:false,pending:null,scopeChanged:true,connectionJob});}}
    if(!['login','catalog','bind'].includes(action))await verifyContextAccount(configFile,contextRun);
    if(action==='catalog'){contextInventory=await contextCatalogLoader((await readConfig(configFile)).historyDays,contextRun);return json(contextInventory);}
    if(action==='map')return json(await contextMap(configFile));
    if(action==='discard')return json(await discardPacket(configFile,payload));
    if(action==='draft')return json(await saveDraft(configFile,payload));
    if(action==='bind')return json(await bindContext(configFile,payload,contextInventory,{run:contextRun}));
    if(action==='collect')return json(await collectContext(configFile,{run:contextRun}));
    if(action==='analyze')return json(await requestAnalysis(configFile,{run:contextRun}));
    if(action==='review')return json(await reviewMap(configFile,payload));
    if(['login','google'].includes(action)){
     if(connectionJob?.status==='pending')return json({status:'pending'});
     let args=['login','--json'];
     if(action==='google'){
      const identity=await account(contextRun);
      if(!contextInventory||contextInventory.account?.userId!==identity.userId||contextInventory.account?.organization.id!==identity.organization.id||!contextInventory.containers.some(c=>c.id===payload.project))return json({error:'UNOBSERVED_SELECTION'},422);
      args=['connectors','connect','google','--project',payload.project,'--scope','https://www.googleapis.com/auth/gmail.readonly','--json'];
     }
     connectionJob={kind:action,status:'pending'};
     // The CLI owns browser opening and token storage. No credentials or raw
     // provider replies are returned to the browser. Re-query confirms success.
     contextRun(args,{timeout:310000}).then(()=>{connectionJob={kind:action,status:'returned'};},()=>{connectionJob={kind:action,status:'not_confirmed'};});
     return json({status:'pending'});
    }
    return json({error:'NOT_FOUND'},404);
   }
   if(!['/setup/discover','/setup/save','/setup/collect','/setup/import'].includes(url.pathname))return json({error:'NOT_FOUND'},404);
   if(busy)return json({error:'SETUP_BUSY'},409);busy=true;
   try{
    const payload=await request.json();
    if(url.pathname==='/setup/discover'){
     const config=await readConfig(configFile);
     if(!inventory||inventory.historyDays!==config.historyDays||Date.now()-Date.parse(inventory.capturedAt)>60000)inventory=await inventoryLoader(config.historyDays);
     return json(setupView(config,inventory,await readSnapshot(configFile)));
    }
    if(url.pathname==='/setup/save')return json(await saveSetup(configFile,payload,inventory));
    if(url.pathname==='/setup/collect'){
     const result=await collect(configFile,{inventoryLoader,...collectOptions});inventory=result.inventory;
     const {inventory:ignored,...safe}=result;return json(safe);
    }
    return json(await importSnapshot(configFile,payload));
   }finally{busy=false;}
  }catch(e){const code=/^[A-Z_]+$/.test(e.message)?e.message:'INVALID_INPUT';return json({error:code},code==='CONFIG_CHANGED'||code==='SETUP_BUSY'?409:422);}
 }});
 // Once the browser starts event observation, its reconciler owns the cadence.
 let ticking=false;const timer=setInterval(async()=>{if(updates||ticking||busy)return;ticking=true;try{await contextTick(configFile,{run:contextRun});}catch{}finally{ticking=false;}},60000);timer.unref?.();
 return {port:server.port,stop(close){stopped=true;clearInterval(timer);stopUpdates();return server.stop(close);}};
}
