// Server-only adapter. The vendored modules are unmodified official SDK output.
import {createInheritedClient,resolveInheritedBaseUrl} from '../vendor/ravi-sdk/inherit.js';
export const SDK_PACKAGE_VERSION='0.260725.1';
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const codes=new Set(['SDK_AUTH_UNAVAILABLE','AUTH_EXPIRED','ACCESS_DENIED','SDK_OPERATION_UNAVAILABLE','SDK_TIMEOUT','SDK_RESPONSE_LIMIT','SOURCE_CONTRACT_CHANGED','SOURCE_UNAVAILABLE','INVALID_NATIVE_ARGUMENT']);
export function safeSdkError(error){
 for(let e=error,n=0;e&&n<4;e=e.cause,n++){
  if(e.status===401)return Error('AUTH_EXPIRED');
  if(e.status===403)return Error('ACCESS_DENIED');
  if(codes.has(e.message))return Error(e.message);
 }
 return Error('SOURCE_UNAVAILABLE');
}
// The upstream timeout ends at response headers. Buffer a bounded complete body
// here, with one deadline and no redirects, before handing it to the SDK parser.
export function boundedFetch(fetchImpl=globalThis.fetch,{timeoutMs=25000,maxBytes=4500000,onMetric=()=>{}}={}){
 if(!Number.isFinite(timeoutMs)||timeoutMs<=0||!Number.isSafeInteger(maxBytes)||maxBytes<=0)throw Error('INVALID_NATIVE_ARGUMENT');
 return async (url,init={})=>{
  const controller=new AbortController(),started=performance.now();let timer,reader,bytes=0,status=0,failed;
  const abort=()=>controller.abort();
  init.signal?.addEventListener('abort',abort,{once:true});
  if(init.signal?.aborted)controller.abort();
  const work=(async()=>{
   const response=await fetchImpl(url,{...init,redirect:'error',signal:controller.signal});status=response.status;
   if(!response.ok){
    response.body?.cancel().catch(()=>{});
    throw Error(status===401?'AUTH_EXPIRED':status===403?'ACCESS_DENIED':status===404?'SDK_OPERATION_UNAVAILABLE':'SOURCE_UNAVAILABLE');
   }
   if(!/^application\/(?:[\w.+-]*\+)?json\b/i.test(response.headers.get('content-type')||''))throw Error('SOURCE_CONTRACT_CHANGED');
   const length=Number(response.headers.get('content-length'));
   if(length>maxBytes)throw Error('SDK_RESPONSE_LIMIT');
   if(!response.body)throw Error('SOURCE_CONTRACT_CHANGED');
   reader=response.body.getReader();const parts=[];
   while(true){const item=await reader.read();if(item.done)break;bytes+=item.value.byteLength;if(bytes>maxBytes)throw Error('SDK_RESPONSE_LIMIT');parts.push(item.value);}
   const buffer=new Uint8Array(bytes);let position=0;
   for(const part of parts){buffer.set(part,position);position+=part.byteLength;}
   let parsed;try{parsed=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(buffer));}catch{throw Error('SOURCE_CONTRACT_CHANGED');}
   if(!object(parsed)||parsed.error||parsed.success===false)throw Error('SOURCE_CONTRACT_CHANGED');
   return new Response(buffer,{status:response.status,headers:{'content-type':'application/json'}});
  })();
  try{
   return await Promise.race([work,new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('SDK_TIMEOUT'));},timeoutMs);})]);
  }catch(e){failed=safeSdkError(e);throw failed;}
  finally{
   clearTimeout(timer);controller.abort();reader?.cancel().catch(()=>{});init.signal?.removeEventListener('abort',abort);
   try{onMetric({transport:'sdk',path:new URL(url).pathname,status,bytes,durationMs:Math.round(performance.now()-started),...(failed?{error:failed.message}:{})});}catch{}
  }
 };
}
export function validateCatalog(raw){
 if(!object(raw)||raw.version!=='1'||!Array.isArray(raw.commands)||raw.commandCount!==raw.commands.length||!Number.isSafeInteger(raw.commandCount)||typeof raw.registryHash!=='string'||!raw.registryHash.length)throw Error('SOURCE_CONTRACT_CHANGED');
 const names=new Set();
 for(const row of raw.commands){
  if(!object(row)||typeof row.fullName!=='string'||typeof row.groupPath!=='string'||typeof row.command!=='string'||row.fullName!==[...row.groupPath.split('.').filter(Boolean),row.command].join('.')||row.path!=='/api/v1/'+[...row.groupPath.split('.').filter(Boolean),row.command].join('/')||names.has(row.fullName))throw Error('SOURCE_CONTRACT_CHANGED');
  names.add(row.fullName);
 }
 return {names,registryHash:raw.registryHash,commandCount:raw.commandCount};
}
export async function createSdkReader({fetchImpl=globalThis.fetch,timeoutMs=25000,maxBytes=4500000,onMetric,clientFactory=createInheritedClient,baseUrlResolver=resolveInheritedBaseUrl}={}){
 const fetch=boundedFetch(fetchImpl,{timeoutMs,maxBytes,onMetric});
 let inherited,baseUrl;
 try{baseUrl=baseUrlResolver();inherited=await clientFactory({fetch,timeoutMs:0});}catch{throw Error('SDK_AUTH_UNAVAILABLE');}
 // A runtime-provided URL is trusted configuration, never browser input. Refuse
 // URL credentials and plaintext remote transport; do not invent a gateway URL.
 const endpoint=new URL(baseUrl);
 if(endpoint.username||endpoint.password||!(endpoint.protocol==='https:'||(endpoint.protocol==='http:'&&['127.0.0.1','localhost','[::1]'].includes(endpoint.hostname))))throw Error('SDK_AUTH_UNAVAILABLE');
 let cached,expires=0,pending;
 async function catalog(){
  if(cached&&Date.now()<expires)return cached;
  if(!pending)pending=(async()=>{
   const result=validateCatalog(await (await fetch(baseUrl+'/api/v1/_meta/registry')).json());cached=result;expires=Date.now()+30000;return result;
  })().finally(()=>{pending=null;});
  return pending;
 }
 return {
  async supports(name){return (await catalog()).names.has(name);},
  async list(kind,options){
   if(!['projects','tasks','agents'].includes(kind))throw Error('INVALID_NATIVE_ARGUMENT');
   if(!await this.supports(kind+'.list'))throw Error('SDK_OPERATION_UNAVAILABLE');
   try{
    const raw=await inherited.client[kind].list(options);
    if(!object(raw)||raw.error||raw.success===false||!Array.isArray(raw.items))throw Error('SOURCE_CONTRACT_CHANGED');
    return raw;
   }catch(e){throw safeSdkError(e);}
  },
  async diagnostics(){
   const c=await catalog();
   return {schema:'workspace.sdk/v1',mode:'sdk',sdkPackageVersion:SDK_PACKAGE_VERSION,registryHash:c.registryHash,commandCount:c.commandCount,operations:Object.fromEntries(['projects.list','tasks.list','agents.list','channels.backend.ingress','channels.backend.readback','channels.backend.interrupt'].map(n=>[n,c.names.has(n)])),identity:'inherited-runtime',sourceAccessVerified:false};
  }
 };
}
const flags={projects:{limit:'number',offset:'number'},agents:{limit:'number',offset:'number'},tasks:{since:'string',until:'string',limit:'number',last:'string',sort:'string',order:'string',cursor:'string'}};
function parseList(args){
 const options={};
 for(let i=2;i<args.length;i++){
  const flag=args[i];if(flag==='--json')continue;
  const name=flag.slice(2),type=flags[args[0]][name],value=args[++i];
  if(!flag.startsWith('--')||!type||value===undefined||options[name]!==undefined)throw Error('INVALID_NATIVE_ARGUMENT');
  if(type==='number'){if(!/^\d+$/.test(value)||!Number.isSafeInteger(Number(value)))throw Error('INVALID_NATIVE_ARGUMENT');options[name]=value;}else options[name]=value;
 }
 return options;
}
// CLI is retained for unmigrated commands, an explicitly absent catalog route,
// or the existing local operator mode without a runtime key. A failed SDK call
// (including metadata failure) never falls through to CLI.
export function createNativeCommand({cli,sdkFactory=createSdkReader,hasRuntime=()=>Boolean(process.env.RAVI_CONTEXT_KEY?.trim()),onMetric=()=>{}}){
 let readerPromise;
 const reader=()=>readerPromise??=(sdkFactory().catch(e=>{readerPromise=null;throw safeSdkError(e);}));
 const viaCli=async(args,options)=>{const started=performance.now();try{return await cli(args,options);}finally{try{onMetric({transport:'cli',operation:args.slice(0,2).join('.'),durationMs:Math.round(performance.now()-started)});}catch{}}};
 const command=async(args,options={})=>{
  if(options.json===false||!flags[args[0]]||args[1]!=='list')return viaCli(args,options);
  const parsed=parseList(args);
  if(!hasRuntime())return viaCli(args,options);
  const sdk=await reader();
  if(!await sdk.supports(args[0]+'.list'))return viaCli(args,options);
  return sdk.list(args[0],parsed);
 };
 command.diagnostics=async()=>hasRuntime()?(await reader()).diagnostics():{schema:'workspace.sdk/v1',mode:'cli-local-operator',sdkPackageVersion:SDK_PACKAGE_VERSION,reason:'NO_INHERITED_RUNTIME',sourceAccessVerified:false};
 return command;
}
