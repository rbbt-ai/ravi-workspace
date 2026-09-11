import {test,expect} from 'bun:test';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createSdkReader,createNativeCommand} from '../src/apps/workspace-hub/lib/sdk.mjs';
import {operations} from '../src/apps/workspace-hub/lib/sdk-operations.mjs';
import {RaviClient} from '../src/apps/workspace-hub/vendor/ravi-sdk/client.js';
import {createHttpTransport} from '../src/apps/workspace-hub/vendor/ravi-sdk/transport/http.js';
import {sessionRows} from '../src/apps/workspace-hub/lib/native.mjs';
import {pages,orgPages,gmailEvidence,conversationEvidence,artifactEvidence,catalog} from '../src/apps/workspace-hub/lib/context-sources.mjs';
import {contextView,bindContext,collectContext,packet,applyContext,reviewMap} from '../src/apps/workspace-hub/lib/context-engine.mjs';
import {initializeConfig} from '../src/apps/workspace-hub/lib/config.mjs';
const meta=()=>({version:'1',registryHash:'isolated',commandCount:Object.keys(operations).length,commands:Object.keys(operations).map(fullName=>({fullName,groupPath:fullName.split('.').slice(0,-1).join('.'),command:fullName.split('.').at(-1),path:'/api/v1/'+fullName.replaceAll('.','/')}))});
const paged=(items,total=items.length,offset=0)=>({items,pagination:{total,offset,returned:items.length,hasMore:offset+items.length<total,nextOffset:offset+items.length<total?offset+items.length:null}});
const identity=org=>({authenticated:true,session:{consoleUrl:'https://console.ravi.bot',user:{id:'user-a'},organization:{id:org,name:'Test organization'}}});
function makeRun(handler,{cli=async()=>{throw Error('CLI_MUST_NOT_RUN');},metrics=[]}={}){
 const fetchImpl=async(url,init)=>url.endsWith('/registry')?Response.json(meta()):handler(new URL(url).pathname.replace('/api/v1/','').replaceAll('/','.'),JSON.parse(init.body));
 return createNativeCommand({cli,hasRuntime:()=>true,sdkFactory:()=>createSdkReader({fetchImpl,onMetric:m=>metrics.push(m),baseUrlResolver:()=> 'http://127.0.0.1:9999',clientFactory:async o=>({client:new RaviClient(createHttpTransport({baseUrl:'http://127.0.0.1:9999',contextKey:'unit-test-only',fetch:o.fetch,timeoutMs:0}))})})});
}
const calls=[
 ['artifacts.list',['artifacts','list','--rich','--limit','200','--offset','0','--json'],{rich:true,limit:'200',offset:'0'},paged([])],
 ['artifacts.show',['artifacts','show','doc-a','--json'],{id:'doc-a'},{artifact:{id:'doc-a'}}],
 ['cloud.projects.list',['cloud','projects','list','--limit','50','--offset','0'],{limit:'50',offset:'0'},paged([])],
 ['pages.published',['pages','published','container-a','--limit','50','--offset','0'],{project:'container-a',limit:'50',offset:'0'},paged([])],
 ['connectors.list',['connectors','list','--project','container-a','--provider','google'],{project:'container-a',provider:'google'},{connections:[]}],
 ['connectors.show',['connectors','show','google-a'],{id:'google-a'},{connection:{id:'google-a'}}],
 ['sessions.list',['sessions','list','--limit','100','--offset','0'],{limit:'100',offset:'0'},paged([])],
 ['sessions.read',['sessions','read','session-a','--workspace','-n','30'],{nameOrKey:'session-a',workspace:true,count:'30'},{session:{name:'session-a'},history:{messages:[]}}],
 ['gmail.list',['gmail','list','--connector','google-a','--max','20','--q','after:123 subject:scope','--label','INBOX,Label_2','--cursor','opaque'],{connector:'google-a',max:'20',q:'after:123 subject:scope',label:'INBOX,Label_2',cursor:'opaque'},{result:{messages:[]}}],
 ['gmail.read',['gmail','read','msg-a','--connector','google-a','--format','full'],{id:'msg-a',connector:'google-a',format:'full'},{result:{id:'msg-a'}}]
];
for(const [name,args,body,result] of calls){
 test(`SDK context preserves ${name} options and native envelope`,async()=>{
  const seen=[];const run=makeRun(async(n,b)=>{seen.push({n,b});return Response.json(result);});
  expect(await run(args)).toEqual(result);expect(seen).toEqual([{n:name,b:body}]);
 });
 test(`SDK ${name} denial, expiry and malformed success never fall back`,async()=>{
  let fallback=0;
  for(const [status,result] of [[401,{error:'private'}],[403,{error:'private'}],[200,{}]]){
   const run=makeRun(async()=>Response.json(result,{status}),{cli:async()=>{fallback++;}});
   await expect(run(args)).rejects.toThrow(status===401?'AUTH_EXPIRED':status===403?'ACCESS_DENIED':'SOURCE_CONTRACT_CHANGED');
  }
  expect(fallback).toBe(0);
 });
}
test('SDK session metadata paginates, drops runtime internals and excludes runtime jobs',async()=>{
 const first={name:'session-a',agentId:'agent-a',ephemeral:false,displayName:'Project group',runtimeOptions:{secret:'INTERNAL_SENTINEL'}},second={name:'cron-sample',agentId:'agent-a',ephemeral:true};let requests=0;
 const run=makeRun(async(n,b)=>{requests++;return Response.json(b.offset==='0'?paged([first],2):paged([second],2,1));});
 const rows=await sessionRows(run);expect(rows).toHaveLength(1);expect(rows[0].name).toBe('Project group');expect(JSON.stringify(rows)).not.toContain('INTERNAL_SENTINEL');expect(requests).toBe(2);
});
test('SDK session duplicates and incomplete pages are rejected without table retry',async()=>{
 const a={name:'session-a',agentId:'agent-a',ephemeral:false};
 await expect(sessionRows(makeRun(async()=>Response.json(paged([a,a]))))).rejects.toThrow('INVALID_SESSION_METADATA');
 await expect(sessionRows(makeRun(async()=>Response.json({...paged([a]),pagination:{...paged([a]).pagination,total:2}})))).rejects.toThrow('INCOMPLETE_INVENTORY');
});
test('artifact catalogs reject contradictory completion and changing totals',async()=>{
 await expect(pages(['artifacts','list'],makeRun(async()=>Response.json({...paged([]),pagination:{...paged([]).pagination,hasMore:true}})))).rejects.toThrow('INCOMPLETE_CATALOG');
 let n=0;await expect(pages(['artifacts','list'],makeRun(async()=>Response.json(n++?paged([{id:'b'}],3,1):paged([{id:'a'}],2))))).rejects.toThrow('UNSTABLE_INVENTORY');
});
test('authorized artifact blob is sampled locally; missing or oversized blobs are not successful empty sources',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'sdk-artifact-')),blob=join(dir,'source.html');
 try{
  await writeFile(blob,'<h1>Project objective</h1><script>DO_NOT_INCLUDE</script><p>'+('Relevant context '.repeat(1000))+'</p>');
  const run=makeRun(async()=>Response.json({artifact:{id:'doc-a',label:'Source',blobPath:blob,mimeType:'text/html',updatedAt:'2026-01-01'}}));
  const result=await artifactEvidence('doc-a',run);expect(result.level).toBe('content-sample');expect(result.text.length).toBeLessThan(1601);expect(result.text).not.toContain('DO_NOT_INCLUDE');expect(result.sourceAt).toBe('2026-01-01T00:00:00.000Z');
  await writeFile(blob,'x'.repeat(1000001));await expect(artifactEvidence('doc-a',run)).rejects.toThrow('ARTIFACT_TOO_LARGE');
  await rm(blob);await expect(artifactEvidence('doc-a',run)).rejects.toThrow();
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('unconfigured Gmail makes no request and exhausted window is marked partial',async()=>{
 let requests=0;expect(await gmailEvidence({...gmailBinding,connectorId:''},15,async()=>{requests++;})).toEqual([]);expect(requests).toBe(0);
 let cursor=0;const run=makeRun(async n=>Response.json(n==='connectors.show'?{connection}:{result:{messages:[],nextPageToken:'cursor-'+(++cursor)}}));
 const r=await gmailEvidence(gmailBinding,15,run);expect(r.complete).toBe(false);expect(cursor).toBe(4);
});
test('Pages versions deduplicate within the selected organization; late org change rejects',async()=>{
 let org='org-a',switchOrg=false;
 const run=makeRun(async(n)=>{
  if(n==='cloud.projects.list')return Response.json(paged([{id:'container-a',orgId:'org-a'}]));
  if(n==='pages.published'){if(switchOrg)org='org-b';return Response.json(paged([{id:'v1',siteId:'site-a',artifactId:'artifact-a',projectId:'container-a',updatedAt:'2026-01-01',artifactVersionId:'v1'},{id:'v2',siteId:'site-a',artifactId:'artifact-a',projectId:'container-a',updatedAt:'2026-02-01',artifactVersionId:'v2'}]));}
  throw Error('UNEXPECTED');
 },{cli:async()=>identity(org)});
 const binding={userId:'user-a',organizationId:'org-a',containers:['container-a']};
 const rows=await orgPages(binding,run);expect(rows).toHaveLength(1);expect(rows[0].version).toBe('v2');
 switchOrg=true;await expect(orgPages(binding,run)).rejects.toThrow('ORGANIZATION_CHANGED');
});
const gmailBinding={connectorId:'google-a',account:'a@example.test',labels:['INBOX'],query:'subject:project'};
const connection={id:'google-a',status:'active',externalAccountLogin:gmailBinding.account,capabilities:['gmail.message.list','gmail.message.read']};
test('Gmail SDK reads one bounded sample per ID, retains labels and rechecks account',async()=>{
 const seen=[];let check=0;
 const run=makeRun(async(n,b)=>{seen.push({n,b});if(n==='connectors.show'){check++;return Response.json({connection});}if(n==='gmail.list')return Response.json({result:{messages:[{id:'a',threadId:'t'}],...(b.cursor?{}:{nextPageToken:'next'})}});return Response.json({result:{id:'a',threadId:'t',internalDate:String(Date.now()-1000),headers:{subject:'Project'},body:{text:'PRIVATE_SENTINEL '.repeat(1000)}}});});
 const result=await gmailEvidence(gmailBinding,15,run);expect(result.items).toHaveLength(1);expect(result.items[0].text.length).toBeLessThan(1601);expect(result.complete).toBe(true);expect(check).toBe(2);expect(seen.filter(x=>x.n==='gmail.read')).toHaveLength(1);expect(seen.find(x=>x.n==='gmail.list').b.label).toBe('INBOX');
});
test('Gmail account changes after content read discard the batch',async()=>{
 let checks=0;const run=makeRun(async n=>Response.json(n==='connectors.show'?{connection:{...connection,externalAccountLogin:checks++?'other@example.test':connection.externalAccountLogin}}:n==='gmail.list'?{result:{messages:[]}}:{}));
 await expect(gmailEvidence(gmailBinding,15,run)).rejects.toThrow('GMAIL_ACCOUNT_MISMATCH');
});
test('Gmail revoked or expired connection reads no mailbox; cursor cycles are rejected',async()=>{
 let reads=0;const revoked=makeRun(async n=>{if(n!=='connectors.show')reads++;return Response.json({connection:{...connection,requiresReauth:true}});});
 await expect(gmailEvidence(gmailBinding,15,revoked)).rejects.toThrow('GMAIL_CONNECTION_UNAVAILABLE');expect(reads).toBe(0);
 let page=0;const cycling=makeRun(async n=>Response.json(n==='connectors.show'?{connection}:{result:{messages:[],nextPageToken:['one','two','one'][page++]}}));
 await expect(gmailEvidence(gmailBinding,15,cycling)).rejects.toThrow('INCOMPLETE_CATALOG');
});
test('conversation SDK preserves selection, date and sample provenance and rejects conflicting IDs',async()=>{
 const message={id:'m1',timestamp:Date.now()-1000,role:'user',content:'A relevant user request with sufficient context.'};let conflict=false;
 const run=makeRun(async()=>Response.json({session:{name:'session-a'},history:{messages:[message,{...message,content:conflict?'Contradictory content':message.content}]}}));
 const result=await conversationEvidence('session-a',15,run);expect(result).toHaveLength(1);expect(result[0].role).toBe('request');expect(result[0].sessionId).toBe('session-a');expect(result[0].sourceAt).toBe(new Date(message.timestamp).toISOString());
 conflict=true;await expect(conversationEvidence('session-a',15,run)).rejects.toThrow('CONFLICTING_MESSAGE');
 const other=makeRun(async()=>Response.json({session:{name:'other'},messages:[]}));await expect(conversationEvidence('session-a',15,other)).rejects.toThrow('SOURCE_CONTRACT_CHANGED');
});
test('SDK context failure preserves map, human correction, fingerprints and synthesis; org switch writes nothing',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'sdk-context-')),file=join(dir,'config.json');let denied=false,org='org-a';
 try{
  await initializeConfig(file);
  const run=makeRun(async(n)=>{
   if(n==='artifacts.show'){if(denied)return Response.json({error:'private'},{status:403});return Response.json({artifact:{id:'doc-a',title:'Test source',summary:'Document metadata',updatedAt:'2026-01-01'}});}
   if(n==='sessions.read'){if(denied)return Response.json({error:'private'},{status:401});return Response.json({session:{name:'session-a'},messages:[{id:'m',timestamp:new Date(Date.now()-1000).toISOString(),role:'user',content:'An explicit business initiative with objective and concrete next actions.'}]});}
   if(n==='tasks.list')return Response.json({items:[],page:{hasMore:false}});
   return Response.json(paged(n==='artifacts.list'?[{id:'doc-a',title:'Source'}]:n==='agents.list'?[{id:'agent-a'}]:n==='sessions.list'?[{name:'session-a',agentId:'agent-a',ephemeral:false}]:[]));
  },{cli:async args=>{if(args[0]==='whoami')return identity(org);throw Error('CLI_MUST_NOT_RUN');}});
  const inventory=await catalog(15,run),v=await contextView(file),binding={userId:'user-a',organizationId:'org-a',containers:[],artifacts:['doc-a'],sessions:['session-a'],projects:[],tasks:[],agentId:'agent-a',gmail:{connectorId:'',account:'',labels:[],query:''},focus:'Projects',days:15};
  await bindContext(file,{revision:v.revision,binding},inventory,{run});await collectContext(file,{run});const p=await packet(file);
  await applyContext(file,{batchId:p.id,baseHash:p.baseHash,decisions:p.evidence.map(e=>({id:e.id,disposition:'use',reason:'Relevant source'})),projects:[{id:'project-a',title:'Project',client:'',objective:'Objective',summary:'Reviewed summary',stage:'Discovery',actions:[],gaps:[],evidence:p.evidence.map(e=>e.id),status:'proposed'}]});
  const map=await contextView(file);map.projects[0].title='Human correction';await reviewMap(file,{revision:map.revision,projects:map.projects});
  const before=JSON.parse(await readFile(file+'.context.json'));denied=true;const result=await collectContext(file,{run});const after=JSON.parse(await readFile(file+'.context.json'));
  expect(result.status).toBe('source_error');for(const field of ['projects','sources','rules','synthesizedAt'])expect(after[field]).toEqual(before[field]);expect(after.coverage['artifact:doc-a'].error).toBe('ACCESS_DENIED');expect(after.coverage['session:session-a'].error).toBe('AUTH_EXPIRED');expect(JSON.stringify(await contextView(file))).not.toContain('An explicit business');
  org='org-b';const bytes=await readFile(file+'.context.json','utf8');await expect(collectContext(file,{run})).rejects.toThrow('ORGANIZATION_CHANGED');expect(await readFile(file+'.context.json','utf8')).toBe(bytes);
 }finally{await rm(dir,{recursive:true,force:true});}
});
