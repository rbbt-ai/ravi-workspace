import {contextState,contextMap,contextTick} from './context-engine.mjs';
import {readFile,writeFile,mkdtemp,rename,rm} from 'node:fs/promises';
import {resolve,join,dirname,relative,basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readConfig,validateConfig,exact} from './config.mjs';
import {collect,readSnapshot,snapshotPath} from './setup.mjs';
import {projectSnapshot} from './snapshot.mjs';
import {renderWorkspace} from './build.mjs';
import {command} from './native.mjs';
import {hash,privatePath,privateDirectory,privateRead,privateWrite,runtimeIdentity,runtimeDelivery,operationLock} from './operation-storage.mjs';
import {consoleIdentity,privateProject,siteName,ownedSite,scheduleSpec,inspectSchedule,matchingJob} from './operation-native.mjs';

const cliFile=fileURLToPath(new URL('../cli.mjs',import.meta.url));
const packageRoot=fileURLToPath(new URL('../../../../',import.meta.url));
const code=e=>/^[A-Z_]+$/.test(e?.message)?e.message:'OPERATION_FAILED';
const same=(a,b)=>hash(a)===hash(b);
const now=()=>new Date().toISOString();
function validateGeneration(g){
 exact(g,['hash','htmlHash','capturedAt'],'GENERATION');
 if(!/^[a-f0-9]{64}$/.test(g.hash)||!/^[a-f0-9]{64}$/.test(g.htmlHash)||!Number.isFinite(Date.parse(g.capturedAt)))throw Error('INVALID_GENERATION');return g;
}
function outsidePackage(path){const rel=relative(resolve(packageRoot),resolve(path));if(!rel.startsWith('..')&&!rel.startsWith('/'))throw Error('STATE_INSIDE_PACKAGE');}
export async function prepareOperation(configFile,root,projectRef,{intervalMinutes=15,run=command}={}){
 if(!Number.isInteger(intervalMinutes)||intervalMinutes<15||intervalMinutes>1440)throw Error('INVALID_CADENCE');
 outsidePackage(root);await privateDirectory(root);
 const source=await readConfig(configFile,{identityRunner:run});
 const identity=await runtimeIdentity(run),consoleUserId=await consoleIdentity(run),project=await privateProject(projectRef,consoleUserId,run);
 const dir=join(resolve(root),source.installationId);await privateDirectory(dir);
 return operationLock(dir,async()=>{
  // Preserve external brand assets; no asset or credential is copied into the product.
  const config=structuredClone(source);for(const k of ['logoFile','displayFontRegular','displayFontBold'])if(config.brand[k])config.brand[k]=resolve(dirname(resolve(configFile)),config.brand[k]);
  const profile={schema:'workspace.operation/v1',installationId:config.installationId,identity,consoleUserId,project,site:siteName(config.installationId),intervalMinutes,configHash:hash(config),preparedAt:now()};
  const previous=await privateRead(join(dir,'operation.json'),{optional:true});
  if(previous){if(!same({...previous,preparedAt:null},{...profile,preparedAt:null}))throw Error('OPERATION_REVIEW_REQUIRED');await loadOperation(dir,run);return {status:'existing',directory:dir,installationId:config.installationId};}
  for(const f of ['config.json','config.json.access.json','config.json.snapshot.json'])if(await privatePath(join(dir,f),{optional:true}))throw Error('STATE_COLLISION');
  const snapshot=await readSnapshot(configFile);projectSnapshot(snapshot,config);
  const context=await contextState(configFile,{run});if(context.pending)throw Error('ANALYSIS_PENDING');
  await privateWrite(join(dir,'config.json'),config);
  if(snapshot)await privateWrite(join(dir,'config.json.snapshot.json'),snapshot);
  if(context.binding)await privateWrite(join(dir,'config.json.context.json'),context);
  await privateWrite(join(dir,'config.json.access.json'),{schema:'workspace.access/v1',configFile:join(dir,'config.json'),identity});
  // Profile last: incomplete preparation cannot be used as a runnable operation.
  await privateWrite(join(dir,'operation.json'),profile);
  return {status:'prepared',directory:dir,installationId:config.installationId,site:profile.site,visibility:'private',scheduled:false,published:false};
 });
}
export async function loadOperation(directory,run=command){
 const dir=resolve(directory);outsidePackage(dir);await privatePath(dir,{directory:true});
 const p=await privateRead(join(dir,'operation.json'));
 exact(p,['schema','installationId','identity','consoleUserId','project','site','intervalMinutes','configHash','preparedAt'],'OPERATION');
 if(p.schema!=='workspace.operation/v1'||p.site!==siteName(p.installationId)||basename(dir)!==p.installationId||!Number.isInteger(p.intervalMinutes)||p.intervalMinutes<15||p.intervalMinutes>1440)throw Error('INVALID_OPERATION');
 if(!same(p.identity,await runtimeIdentity(run)))throw Error('INSTALLATION_IDENTITY_MISMATCH');
 const config=await readConfig(join(dir,'config.json'),{identityRunner:run});
 if(config.installationId!==p.installationId||hash(config)!==p.configHash)throw Error('OPERATION_REVIEW_REQUIRED');
 return {dir,profile:p,config};
}
export async function operationStatus(directory,{run=command}={}){
 const {dir,profile:p}=await loadOperation(directory,run);
 const current=await privateRead(join(dir,'current.json'),{optional:true}),published=await privateRead(join(dir,'published.json'),{optional:true}),attempt=await privateRead(join(dir,'last-attempt.json'),{optional:true});
 return {status:'ready',installationId:p.installationId,agentId:p.identity.agentId,intervalMinutes:p.intervalMinutes,visibility:'private',collectedAt:current?.capturedAt??null,publishedAt:published?.at??null,url:published?.url??null,lastAttempt:attempt,credentialPersistence:false,schedule:(await privateRead(join(dir,'schedule.json'),{optional:true}))?.status??'not_configured'};
}
async function recheck(profile,run){
 if(!same(profile.identity,await runtimeIdentity(run)))throw Error('INSTALLATION_IDENTITY_MISMATCH');
 if(!same(profile.project,await privateProject(profile.project.id,profile.consoleUserId,run)))throw Error('PROJECT_CHANGED');
}
async function publishGeneration(dir,p,generation,run){
 validateGeneration(generation);
 await recheck(p,run);
 const folder=join(dir,'generations',generation.hash);await privatePath(folder,{directory:true});
 const html=await readFile(join(folder,'index.html'),'utf8');if(hash(html)!==generation.htmlHash)throw Error('GENERATION_INTEGRITY_FAILED');
 let site=await ownedSite(p,run);
 if(!site){
  const result=await run(['pages','create',p.project.id,p.site,'--visibility','private','--json']);
  if(result.success!==true)throw Error('PRIVATE_SITE_UNCONFIRMED');
  site=await ownedSite(p,run);if(!site)throw Error('PRIVATE_SITE_UNCONFIRMED');
 }
 // Upload only this allowlisted index. Never upload config, identity or snapshot files.
 const stage=await mkdtemp(join(dir,'.publish-'));await privatePath(stage,{directory:true});
 try{
  await writeFile(join(stage,'index.html'),html,{mode:0o600,flag:'wx'});
  await recheck(p,run);
  const result=await run(['pages','publish',p.project.id,p.site,stage,'--route','/','--visibility','private','--entrypoint','index.html','--replace-release','--idempotency-key','workspace-'+generation.hash,'--reason','Atualização privada por instalação','--json'],{timeout:180000});
  if(result.success!==true||typeof result.release?.id!=='string')throw Error('PRIVATE_PUBLISH_UNCONFIRMED');
  const after=await ownedSite(p,run);if(after?.activeReleaseId!==result.release.id)throw Error('PRIVATE_PUBLISH_UNCONFIRMED');
  const receipt={at:now(),hash:generation.hash,htmlHash:generation.htmlHash,sourceDate:generation.capturedAt,visibility:'private',releaseId:after.activeReleaseId,url:'https://'+p.site+'.ravi.page/'};
  await privateWrite(join(dir,'published.json'),receipt);
  await privateWrite(join(dir,'pending.json'),null);return receipt;
 }finally{await rm(stage,{recursive:true,force:true});}
}
export async function refreshOperation(directory,{publish=false,run=command,collector=collect}={}){
 const {dir,profile:p,config}=await loadOperation(directory,run);
 return operationLock(dir,async()=>{
  let staging;
  try{
   const pending=await privateRead(join(dir,'pending.json'),{optional:true});
   if(pending){if(!publish)throw Error('PUBLICATION_PENDING');const receipt=await publishGeneration(dir,p,pending,run);return {status:'published_private',...receipt};}
   const last=await privateRead(join(dir,'last-attempt.json'),{optional:true});
   if(last&&Date.now()-Date.parse(last.at)<p.intervalMinutes*60000){
    const current=await privateRead(join(dir,'current.json'),{optional:true}),published=await privateRead(join(dir,'published.json'),{optional:true});
    // An explicit publish after local review applies the reviewed generation,
    // without replacing it with another collection during the same cadence.
    if(publish&&last.status==='collected'&&current&&published?.hash!==current.hash){await privateWrite(join(dir,'pending.json'),validateGeneration(current));return {status:'published_private',...await publishGeneration(dir,p,current,run)};}
    return {status:'not_due'};
   }
   // Console identity is bound even for a local cycle, so credentials from a
   // different installation cannot silently supply this snapshot.
   await recheck(p,run);
   staging=await mkdtemp(join(dir,'.collect-'));await privatePath(staging,{directory:true});
   const input=join(staging,'config.json');await privateWrite(input,config);
   const old=await privateRead(join(dir,'config.json.snapshot.json'),{optional:true});if(old)await privateWrite(snapshotPath(input),old);
   const result=await collector(input);
   const active=config.sources.filter(s=>s!=='connections');
   if(active.length&&!active.some(s=>result.results?.[s]?.status==='ready'))throw Error('NO_CONFIRMED_SOURCE');
   const snapshot=await privateRead(snapshotPath(input));projectSnapshot(snapshot,config);
   if(Date.parse(snapshot.capturedAt)<Date.now()-600000||Date.parse(snapshot.capturedAt)>Date.now()+60000)throw Error('STALE_COLLECTION');
   const contextFile=join(dir,'config.json');
   await contextTick(contextFile,{run});
   const {html}=await renderWorkspace(config,snapshot,dirname(input),await contextMap(contextFile,{run}));
   await recheck(p,run);const reread=await readConfig(join(dir,'config.json'),{identityRunner:run});if(hash(reread)!==p.configHash)throw Error('CONFIG_CHANGED');
   const generation={hash:hash({installationId:p.installationId,project:p.project.id,snapshot,html}),htmlHash:hash(html),capturedAt:snapshot.capturedAt};
   const generations=await privateDirectory(join(dir,'generations')),target=join(generations,generation.hash);
   // Separate immutable generation and atomic pointer; a failure leaves the
   // previous pointer, publication and valid source dates intact.
   const completed=await mkdtemp(join(dir,'.generation-'));
   try{await writeFile(join(completed,'index.html'),html,{mode:0o600,flag:'wx'});await privateWrite(join(completed,'snapshot.json'),snapshot);await rename(completed,target);}catch(e){await rm(completed,{recursive:true,force:true});throw e;}
   await privateWrite(join(dir,'config.json.snapshot.json'),snapshot);
   await privateWrite(join(dir,'current.json'),generation);
   await privateWrite(join(dir,'last-attempt.json'),{at:now(),status:'collected',error:null});
   if(!publish)return {status:'collected',generation:generation.hash,capturedAt:generation.capturedAt,results:result.results};
   // Persist digest BEFORE external mutation. Ambiguous failures retry the same
   // bytes/idempotency key, never start a new collection or claim success.
   await privateWrite(join(dir,'pending.json'),generation);
   const receipt=await publishGeneration(dir,p,generation,run);
   return {status:'published_private',...receipt,results:result.results};
  }catch(e){await privateWrite(join(dir,'last-attempt.json'),{at:now(),status:'failed',error:code(e)});throw e;}
  finally{if(staging)await rm(staging,{recursive:true,force:true});}
 });
}
export async function scheduleOperation(directory,{apply=false,run=command}={}){
 const {dir,profile:p}=await loadOperation(directory,run);
 return operationLock(dir,async()=>{
  await recheck(p,run);const delivery=await runtimeDelivery(run),spec=scheduleSpec(p,dir,cliFile,delivery),existing=await inspectSchedule(spec,run);
  if(existing){await privateWrite(join(dir,'schedule.json'),existing);return existing;}
  if(!apply)return {status:'planned',installationId:p.installationId,agentId:spec.agentId,name:spec.name,intervalMinutes:p.intervalMinutes,isolated:true,executionType:'agent',applied:false};
  // A durable intent prevents a retry after an ambiguous CLI timeout from
  // creating another job. Recovery first inspects the full native inventory.
  if(await privateRead(join(dir,'schedule-intent.json'),{optional:true}))throw Error('SCHEDULE_CREATION_UNCONFIRMED');
  await privateWrite(join(dir,'schedule-intent.json'),{at:now(),specHash:hash(spec)});
  const result=await run(['cron','add',spec.name,'--agent',spec.agentId,'--account',spec.accountId,'--isolated','--every',p.intervalMinutes+'m','--description',spec.description,'--message',spec.message,'--json']);
  const job=result.job;if(!job?.id||!matchingJob(job,spec))throw Error('SCHEDULE_CREATION_UNCONFIRMED');
  const confirmed=await run(['cron','show',job.id,'--json']);
  if(!confirmed.job||!matchingJob(confirmed.job,spec))throw Error('SCHEDULE_CREATION_UNCONFIRMED');
  const receipt={status:'scheduled',id:job.id,at:now()};await privateWrite(join(dir,'schedule.json'),receipt);return receipt;
 });
}
