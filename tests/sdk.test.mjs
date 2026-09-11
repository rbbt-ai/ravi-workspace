import {test,expect} from 'bun:test';
import {boundedFetch,createSdkReader,createNativeCommand,validateCatalog,SDK_PACKAGE_VERSION} from '../src/apps/workspace-hub/lib/sdk.mjs';
import {RaviClient} from '../src/apps/workspace-hub/vendor/ravi-sdk/client.js';
import {createHttpTransport} from '../src/apps/workspace-hub/vendor/ravi-sdk/transport/http.js';
import {nativeRows,discover} from '../src/apps/workspace-hub/lib/native.mjs';
const names=['projects.list','tasks.list','agents.list'];
const catalog=(operations=names)=>({version:'1',registryHash:'test-hash',commandCount:operations.length,commands:operations.map(fullName=>({fullName,groupPath:fullName.split('.').slice(0,-1).join('.'),command:fullName.split('.').at(-1),path:'/api/v1/'+fullName.replaceAll('.','/')}))});
const page=(items,offset=0,total=items.length,more=false)=>({items,pagination:{hasMore:more,offset,total,returned:items.length,nextOffset:more?offset+items.length:null}});
const row={id:'unit-project',title:'Isolated test project',status:'active'};
function sdk(fetchImpl,options={}){
 return createSdkReader({fetchImpl,baseUrlResolver:()=> 'http://127.0.0.1:9999',clientFactory:async options=>({client:new RaviClient(createHttpTransport({baseUrl:'http://127.0.0.1:9999',contextKey:'unit-test-only',fetch:options.fetch,timeoutMs:0}))}),...options});
}
function reader(fetchImpl,cli=async()=>{throw Error('CLI_MUST_NOT_RUN');}){return createNativeCommand({cli,sdkFactory:()=>sdk(fetchImpl),hasRuntime:()=>true});}
test('SDK package pinned, runtime catalog checked independently',async()=>{
 const d=await (await sdk(async()=>Response.json(catalog()))).diagnostics();
 expect(d.sdkPackageVersion).toBe(SDK_PACKAGE_VERSION);expect(d.operations['projects.list']).toBe(true);expect(d.operations['channels.backend.ingress']).toBe(false);expect(d.sourceAccessVerified).toBe(false);expect(JSON.stringify(d)).not.toContain('unit-test-only');
});
test('official SDK call preserves native string options and request path',async()=>{
 const requests=[];const run=reader(async(url,init)=>{if(url.endsWith('/registry'))return Response.json(catalog());requests.push({url,method:init.method,body:JSON.parse(init.body)});return Response.json(page([row]));});
 expect(await nativeRows('projects',15,run)).toEqual([row]);
 expect(requests).toEqual([{url:'http://127.0.0.1:9999/api/v1/projects/list',method:'POST',body:{limit:'100',offset:'0'}}]);
});
test('SDK handles offset pagination without process calls',async()=>{
 const run=reader(async(url,init)=>url.endsWith('/registry')?Response.json(catalog()):Response.json(JSON.parse(init.body).offset==='0'?page([row],0,2,true):page([{...row,id:'second'}],1,2,false)));
 expect((await nativeRows('projects',15,run)).map(r=>r.id)).toEqual(['unit-project','second']);
});
test('cursor and temporal window preserved across SDK task pages',async()=>{
 const calls=[];const run=reader(async(url,init)=>{if(url.endsWith('/registry'))return Response.json(catalog());const body=JSON.parse(init.body);calls.push(body);return Response.json({items:[{...row,id:body.cursor?'second':'first'}],page:{hasMore:!body.cursor,nextCursor:body.cursor?null:'next'}});});
 expect(await nativeRows('tasks',15,run)).toHaveLength(2);expect(calls[1].cursor).toBe('next');expect(calls[1].until).toBe(calls[0].until);expect(calls[1].since).toBe(calls[0].since);expect(calls[0].last).toBe('all');
});
for(const [status,code] of [[401,'AUTH_EXPIRED'],[403,'ACCESS_DENIED'],[404,'SDK_OPERATION_UNAVAILABLE'],[500,'SOURCE_UNAVAILABLE']])test(`HTTP ${status} is unavailable and never retries via CLI`,async()=>{
 let fallback=0;const run=reader(async url=>url.endsWith('/registry')?Response.json(catalog()):Response.json({error:'provider detail must not escape'}, {status}),async()=>{fallback++;});
 await expect(nativeRows('projects',15,run)).rejects.toThrow(code);expect(fallback).toBe(0);
});
test('catalog failure is not interpreted as an absent operation',async()=>{
 let fallback=0;const run=reader(async()=>Response.json({error:'denied'},{status:403}),async()=>{fallback++;});await expect(run(['projects','list','--json'])).rejects.toThrow('ACCESS_DENIED');expect(fallback).toBe(0);
});
test('explicitly absent catalog operation keeps the existing CLI implementation',async()=>{
 let count=0;const run=reader(async()=>Response.json(catalog(['agents.list'])),async()=>{count++;return page([row]);});expect(await nativeRows('projects',15,run)).toEqual([row]);expect(count).toBe(1);
});
test('operator mode without inherited runtime retains CLI without constructing SDK',async()=>{
 let count=0;const run=createNativeCommand({hasRuntime:()=>false,sdkFactory:async()=>{throw Error('MUST_NOT_CREATE');},cli:async()=>{count++;return page([row]);}});expect(await nativeRows('projects',15,run)).toEqual([row]);expect(count).toBe(1);expect((await run.diagnostics()).reason).toBe('NO_INHERITED_RUNTIME');
});
test('missing gateway with runtime never escalates to local operator mode',async()=>{
 let count=0;const run=createNativeCommand({hasRuntime:()=>true,sdkFactory:async()=>{throw Error('SDK_AUTH_UNAVAILABLE');},cli:async()=>{count++;}});await expect(run(['projects','list','--json'])).rejects.toThrow('SDK_AUTH_UNAVAILABLE');expect(count).toBe(0);
});
test('unmigrated source retains its existing handler',async()=>{let args;const run=createNativeCommand({cli:async a=>{args=a;return 'original';},sdkFactory:async()=>{throw Error('MUST_NOT_CREATE');}});expect(await run(['sessions','list'],{json:false})).toBe('original');expect(args).toEqual(['sessions','list']);});
for(const body of ['','<html>Login</html>','{bad','{}','{"error":"MalformedResponse","message":"private details"}','{"success":false}'])test(`invalid successful response ${body.slice(0,18)} fails closed`,async()=>{
 const run=reader(async url=>url.endsWith('/registry')?Response.json(catalog()):new Response(body,{headers:{'content-type':'application/json'}}));await expect(nativeRows('projects',15,run)).rejects.toThrow('SOURCE_CONTRACT_CHANGED');
});
test('HTML login and remote redirects never become an authenticated empty result',async()=>{
 let redirect;const f=boundedFetch(async(url,options)=>{redirect=options.redirect;return new Response('<html>Login</html>',{headers:{'content-type':'text/html'}});});await expect(f('http://127.0.0.1/test')).rejects.toThrow('SOURCE_CONTRACT_CHANGED');expect(redirect).toBe('error');
});
test('full response timeout covers a stalled body after successful headers',async()=>{
 let cancelled=false;const f=boundedFetch(async()=>new Response(new ReadableStream({start(c){c.enqueue(new TextEncoder().encode('{'));},cancel(){cancelled=true;}}),{headers:{'content-type':'application/json'}}),{timeoutMs:25});const start=performance.now();await expect(f('http://127.0.0.1/test')).rejects.toThrow('SDK_TIMEOUT');expect(performance.now()-start).toBeLessThan(500);expect(cancelled).toBe(true);
});
test('fetch that ignores abort still cannot exceed the adapter deadline',async()=>{const f=boundedFetch(()=>new Promise(()=>{}),{timeoutMs:20});await expect(f('http://127.0.0.1/test')).rejects.toThrow('SDK_TIMEOUT');});
test('response limit is enforced on streams without Content-Length',async()=>{
 let cancelled=false;const f=boundedFetch(async()=>new Response(new ReadableStream({start(c){c.enqueue(new Uint8Array(33));},cancel(){cancelled=true;}}),{headers:{'content-type':'application/json'}}),{maxBytes:32});await expect(f('http://127.0.0.1/test')).rejects.toThrow('SDK_RESPONSE_LIMIT');expect(cancelled).toBe(true);
});
test('large JSON is retained exactly, metrics omit content and credentials',async()=>{
 const value={text:'a'.repeat(100000)},events=[];const f=boundedFetch(async()=>Response.json(value),{onMetric:x=>events.push(x)});expect(await (await f('http://127.0.0.1/read?private=value')).json()).toEqual(value);expect(events[0].bytes).toBeGreaterThan(100000);expect(JSON.stringify(events)).not.toContain('private');expect(Object.keys(events[0]).sort()).toEqual(['bytes','durationMs','path','status','transport']);
});
test('catalog integrity rejects duplicate names or incomplete inventory',()=>{const c=catalog();c.commandCount=0;expect(()=>validateCatalog(c)).toThrow();const d=catalog(['projects.list','projects.list']);expect(()=>validateCatalog(d)).toThrow();});
test('multiple native operations share a single concurrent catalog read',async()=>{
 let meta=0;const run=reader(async url=>{if(url.endsWith('/registry')){meta++;await new Promise(r=>setTimeout(r,10));return Response.json(catalog());}return Response.json(page([row]));});await Promise.all(['projects','agents'].map(k=>nativeRows(k,15,run)));expect(meta).toBe(1);
});
test('SDK duplicate rows and prematurely ended pagination cannot publish partial inventory',async()=>{
 const duplicate=reader(async url=>Response.json(url.endsWith('/registry')?catalog():page([row,row])));await expect(nativeRows('projects',15,duplicate)).rejects.toThrow('INVALID_NATIVE_ID');
 const short=reader(async url=>Response.json(url.endsWith('/registry')?catalog():page([row],0,2)));await expect(nativeRows('projects',15,short)).rejects.toThrow('INCOMPLETE_INVENTORY');
});
test('unknown list flags fail locally instead of changing query semantics',async()=>{const run=reader(async()=>{throw Error('NO_NETWORK');});await expect(run(['projects','list','--shell','anything'])).rejects.toThrow('INVALID_NATIVE_ARGUMENT');});
test('SDK failures produce unavailable coverage, never ready empty',async()=>{
 const run=reader(async()=>Response.json({error:'expired'},{status:401}),async()=>{throw Error('SOURCE_UNAVAILABLE');});const d=await discover(15,run);expect(d.coverage.projects.status).toBe('unavailable');expect(d.coverage.projects.error).toBe('AUTH_EXPIRED');expect(d.projects).toEqual([]);
});

test('SDK access failure through collector preserves selected records and original source date',async()=>{
 const {mkdtemp,rm}=await import('node:fs/promises');const {tmpdir}=await import('node:os');const {join}=await import('node:path');
 const {initializeConfig,readConfig}=await import('../src/apps/workspace-hub/lib/config.mjs');
 const {collect,readSnapshot,atomic}=await import('../src/apps/workspace-hub/lib/setup.mjs');
 const dir=await mkdtemp(join(tmpdir(),'sdk-cache-test-')),file=join(dir,'config.json');let denied=false;
 try{
  await initializeConfig(file);const c=await readConfig(file);c.sources=['projects'];c.selection.projects=[row.id];await atomic(file,c);
  const run=reader(async url=>{if(url.endsWith('/registry'))return Response.json(catalog());if(denied)return Response.json({error:'private provider detail'},{status:403});return Response.json(url.includes('/tasks/')?{items:[],page:{hasMore:false,nextCursor:null}}:page(url.includes('/projects/')?[row]:[]));},async()=> 'All sessions (0 returned of 0, limit 100, offset 0):\n');
  await collect(file,{inventoryLoader:()=>discover(15,run)});const before=await readSnapshot(file);expect(before.sourceStates.projects.status).toBe('ready');expect(before.presentation.home.projects).toHaveLength(1);
  denied=true;await collect(file,{inventoryLoader:()=>discover(15,run)});const after=await readSnapshot(file);
  expect(after.presentation.home.projects).toEqual(before.presentation.home.projects);expect(after.sourceStates.projects.capturedAt).toBe(before.sourceStates.projects.capturedAt);expect(after.sourceStates.projects.status).toBe('stale');expect(JSON.stringify(after)).not.toContain('private provider detail');
 }finally{await rm(dir,{recursive:true,force:true});}
});
