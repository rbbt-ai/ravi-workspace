import {lstat,realpath,mkdir,readFile,writeFile,rename,unlink} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {randomUUID,createHash} from 'node:crypto';
import {hostname} from 'node:os';
import {command} from './native.mjs';

export const hash=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
export async function privatePath(path,{directory=false,optional=false}={}){
 const file=resolve(path);let info;
 try{info=await lstat(file);}catch(e){if(optional&&e.code==='ENOENT')return false;throw e;}
 if(info.isSymbolicLink()||await realpath(file)!==file)throw Error('UNSAFE_STORAGE_PATH');
 if((directory?!info.isDirectory():!info.isFile())||info.uid!==process.getuid?.()||(info.mode&0o077)||(!directory&&info.nlink!==1))throw Error('PRIVATE_STORAGE_REQUIRED');
 return true;
}
export async function privateDirectory(path){
 await mkdir(path,{recursive:true,mode:0o700});await privatePath(path,{directory:true});return resolve(path);
}
export async function privateWrite(path,value){
 await privatePath(dirname(path),{directory:true});await privatePath(path,{optional:true});
 const temp=path+'.'+randomUUID()+'.tmp';
 try{await writeFile(temp,JSON.stringify(value,null,2)+'\n',{mode:0o600,flag:'wx'});await rename(temp,path);}finally{await unlink(temp).catch(e=>{if(e.code!=='ENOENT')throw e;});}
}
export async function privateRead(path,{optional=false}={}){
 if(!await privatePath(path,{optional}))return null;
 const s=await readFile(path,'utf8');if(s.length>10000000)throw Error('STATE_TOO_LARGE');return JSON.parse(s);
}
export async function runtimeIdentity(run=command){
 const raw=await run(['self','whoami','--json']),i=raw.identity,m=i?.metadata;
 if(i?.kind!=='turn-runtime'||i.revokedAt||!Number.isFinite(i.expiresAt)||i.expiresAt<Date.now()+30000||!i.agentId||!m?.agentIdentityPrincipal)throw Error('LIVE_AGENT_IDENTITY_REQUIRED');
 // Never persist runtime context IDs, keys, source messages or expiry leases.
 return {agentId:i.agentId,principal:m.agentIdentityPrincipal,uid:process.getuid(),host:hostname()};
}
export async function runtimeDelivery(run=command){
 const raw=await run(['self','whoami','--json']),i=raw.identity;
 if(typeof i?.sessionKey!=='string'||!i.sessionKey||typeof i.source?.accountId!=='string'||!i.source.accountId)throw Error('SCHEDULE_DELIVERY_NOT_CONFIRMED');
 return {replySession:i.sessionKey,accountId:i.source.accountId};
}
export async function assertBoundConfig(file,run=command){
 const binding=await privateRead(resolve(file)+'.access.json',{optional:true});if(!binding)return;
 await privatePath(dirname(resolve(file)),{directory:true});await privatePath(file);
 if(binding.schema!=='workspace.access/v1'||binding.configFile!==resolve(file)||hash(binding.identity)!==hash(await runtimeIdentity(run)))throw Error('INSTALLATION_IDENTITY_MISMATCH');
}
export async function operationLock(dir,fn){
 await privatePath(dir,{directory:true});const file=resolve(dir,'operation.lock');
 try{await writeFile(file,JSON.stringify({pid:process.pid,at:new Date().toISOString()}),{mode:0o600,flag:'wx'});}catch(e){if(e.code==='EEXIST')throw Error('OPERATION_ALREADY_RUNNING');throw e;}
 // Never guess that a lock is stale or steal it on a timer.
 try{return await fn();}finally{await unlink(file);}
}
