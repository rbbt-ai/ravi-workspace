// Server-only transport. Event IDs are connection-local, not replay cursors.
import {RaviStreamClient} from '../vendor/ravi-sdk/streaming.js';
import {resolveInheritedBaseUrl,resolveInheritedContextKey} from '../vendor/ravi-sdk/inherit.js';
import {safeSdkError} from './sdk.mjs';

export function streamFetch(fetchImpl=globalThis.fetch,{headerMs=10000,idleMs=45000,maxFrameBytes=262144,onOpen=()=>{}}={}){
 return async(url,init={})=>{
  const abort=new AbortController();let timer,reader,finished=false;
  const forward=()=>abort.abort();init.signal?.addEventListener('abort',forward,{once:true});if(init.signal?.aborted)forward();
  const cleanup=()=>{clearTimeout(timer);init.signal?.removeEventListener('abort',forward);abort.abort();reader?.cancel().catch(()=>{});};
  const deadline=ms=>{clearTimeout(timer);timer=setTimeout(()=>abort.abort(),ms);};
  const bounded=promise=>new Promise((resolve,reject)=>{
   const cancelled=()=>{abort.signal.removeEventListener('abort',cancelled);reject(Error('SDK_TIMEOUT'));};
   if(abort.signal.aborted){cancelled();return;}
   abort.signal.addEventListener('abort',cancelled,{once:true});
   promise.then(value=>{abort.signal.removeEventListener('abort',cancelled);resolve(value);},e=>{abort.signal.removeEventListener('abort',cancelled);reject(e);});
  });
  try{
   deadline(headerMs);
   const response=await bounded(Promise.resolve(fetchImpl(url,{...init,redirect:'error',signal:abort.signal})).then(r=>{if(abort.signal.aborted)r.body?.cancel().catch(()=>{});return r;}));
   if(!response.ok)throw Error(response.status===401?'AUTH_EXPIRED':response.status===403?'ACCESS_DENIED':response.status===404?'SDK_OPERATION_UNAVAILABLE':'SOURCE_UNAVAILABLE');
   if(!/^text\/event-stream\b/i.test(response.headers.get('content-type')||'')||!response.body)throw Error('SOURCE_CONTRACT_CHANGED');
   reader=response.body.getReader();deadline(idleMs);onOpen();
   // Forward only complete bounded frames, also normalizing split CRLF pairs
   // before the upstream parser. Heartbeats count for transport liveness only.
   const decoder=new TextDecoder('utf-8',{fatal:true}),encoder=new TextEncoder();let pending='';
   return new Response(new ReadableStream({async pull(controller){
    try{
     while(true){
      const boundary=/\r\n\r\n|\n\n|\r\r/.exec(pending);
      if(boundary){const end=boundary.index+boundary[0].length,frame=pending.slice(0,end);pending=pending.slice(end);if(encoder.encode(frame).length>maxFrameBytes)throw Error('SDK_RESPONSE_LIMIT');controller.enqueue(encoder.encode(frame.replace(/\r\n/g,'\n').replace(/\r/g,'\n')));return;}
      if(encoder.encode(pending).length>maxFrameBytes)throw Error('SDK_RESPONSE_LIMIT');
      const part=await bounded(reader.read());if(part.done){if(pending.trim())throw Error('SOURCE_CONTRACT_CHANGED');finished=true;cleanup();controller.close();return;}
      deadline(idleMs);pending+=decoder.decode(part.value,{stream:true});
      if(pending.length>maxFrameBytes*2)throw Error('SDK_RESPONSE_LIMIT');
     }
    }catch(e){cleanup();controller.error(safeSdkError(e));}
   },cancel(){if(!finished)cleanup();}}),{headers:{'content-type':'text/event-stream'}});
  }catch(e){cleanup();throw safeSdkError(e);}
 };
}

export function createEventStream({fetchImpl=globalThis.fetch,baseUrl=resolveInheritedBaseUrl(),contextKey=resolveInheritedContextKey()}={}){
 const endpoint=new URL(baseUrl);
 if(endpoint.username||endpoint.password||!(endpoint.protocol==='https:'||endpoint.protocol==='http:'&&['127.0.0.1','localhost','[::1]'].includes(endpoint.hostname)))throw Error('SDK_AUTH_UNAVAILABLE');
 return (subject,{signal,onOpen})=>{
  // Subject comes from the backend's finite plan, never HTTP input.
  const client=new RaviStreamClient({baseUrl,contextKey,fetch:streamFetch(fetchImpl,{onOpen})});
  return client.events({subject,noClaude:true,noHeartbeat:true,signal});
 };
}
