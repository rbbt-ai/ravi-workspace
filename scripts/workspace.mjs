// Package-owned installer. Does not edit Ravi configuration, identity or grants.
import {existsSync,lstatSync,realpathSync,mkdirSync,readdirSync,readFileSync,writeFileSync,renameSync,rmSync,chmodSync} from 'node:fs';
import {resolve,join,dirname,relative} from 'node:path';
import {homedir,hostname} from 'node:os';
import {randomUUID,createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {DEFAULT_CONFIG,validateConfig} from '../src/apps/workspace-hub/lib/config.mjs';

const sourceRoot=resolve(fileURLToPath(new URL('..',import.meta.url)));
const marker='.workspace-install.json';
const sha=x=>createHash('sha256').update(x).digest('hex');
const fail=code=>{throw Error(code)};
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const write=(p,v)=>{const t=p+'.'+randomUUID()+'.tmp';writeFileSync(t,JSON.stringify(v,null,2)+'\n',{flag:'wx',mode:0o600});renameSync(t,p)};
function safe(p,{optional=false}={}){
 if(!existsSync(p)){if(optional){try{lstatSync(p);fail('UNSAFE_PATH')}catch(e){if(e.code!=='ENOENT')throw e}return false}fail('MISSING_PATH')}
 const s=lstatSync(p);if(s.isSymbolicLink()||realpathSync(p)!==resolve(p)||s.uid!==process.getuid?.())fail('UNSAFE_PATH');return s;
}
function privateDir(p){mkdirSync(p,{recursive:true,mode:0o700});const s=safe(p);if(!s.isDirectory()||(s.mode&0o077))fail('PRIVATE_DIRECTORY_REQUIRED')}
function tree(root){
 const result={};let total=0;
 function visit(dir){safe(dir);for(const name of readdirSync(dir).sort()){
  const p=join(dir,name),s=safe(p),rel=relative(root,p);
  if(s.isDirectory())visit(p);
  else if(s.isFile()&&s.nlink===1){total+=s.size;if(total>100_000_000)fail('BACKUP_TOO_LARGE');result[rel]=readFileSync(p)}
  else fail('UNSUPPORTED_FILE');
 }}visit(root);return result;
}
function copy(files,dest){privateDir(dest);for(const [name,bytes] of Object.entries(files)){const p=join(dest,name);privateDir(dirname(p));writeFileSync(p,bytes,{mode:0o600,flag:'wx'})}}
function treeHash(files){return sha(JSON.stringify(Object.entries(files).filter(([k])=>k!==marker).map(([k,v])=>[k,sha(v)]).sort((a,b)=>a[0].localeCompare(b[0]))))}
export function paths(stateDir){const state=resolve(stateDir);return {state,apps:join(state,'apps'),app:join(state,'apps/workspace-hub'),root:join(state,'workspace-hub-installation'),data:join(state,'workspace-hub-installation/data'),config:join(state,'workspace-hub-installation/data/config.json')}}
function installed(p){
 if(!safe(p.app,{optional:true}))return null;
 if(!existsSync(join(p.app,marker)))fail('UNMANAGED_APP');
 const files=tree(p.app),m=JSON.parse(files[marker]);
 if(m.schema!=='workspace.install/v1'||m.state!==p.state||m.hash!==treeHash(files))fail('INSTALLATION_MODIFIED');
 return m;
}
function loadSource(root){
 const policy=read(join(root,'distribution/contents.json'));
 if(policy.schema!=='workspace.distribution/v1'||!Array.isArray(policy.files))fail('INVALID_DISTRIBUTION');
 const files={},prefix='src/apps/workspace-hub/';
 for(const name of policy.files.filter(n=>n.startsWith(prefix))){
  if(!/^[\w./-]+$/.test(name)||name.split('/').some(p=>!p||p==='..'||p==='.'))fail('INVALID_DISTRIBUTION');
  const p=join(root,name);if(!safe(p).isFile())fail('INVALID_DISTRIBUTION');files[name.slice(prefix.length)]=readFileSync(p);
 }
 const actual=tree(join(root,'src/apps/workspace-hub'));
 if(JSON.stringify(Object.keys(actual).sort())!==JSON.stringify(Object.keys(files).sort()))fail('UNEXPECTED_APP_FILE');
 for(const name of ['LICENSE','THIRD-PARTY-NOTICES.md']){safe(join(root,name));files[name]=readFileSync(join(root,name))}
 const app=JSON.parse(files['ravi.app.json']),pkg=read(join(root,'package.json'));
 if(app.id!=='workspace-hub'||app.schema!=='ravi.app/v1'||app.version!==pkg.version||!files['cli.mjs']||!files['ui/workspace/template.html'])fail('INVALID_APP');
 return {files,version:app.version,hash:treeHash(files)};
}
function checkConfig(p){
 if(!existsSync(p.config))return null;
 safe(p.config);return validateConfig(read(p.config)); // v1 defaults are additive; no migration writes.
}
function backup(p,current){
 const dest=join(p.root,'backups',randomUUID());privateDir(dest);
 if(current)copy(tree(p.app),join(dest,'app'));
 const data=existsSync(p.data)?tree(p.data):{};if(Object.keys(data).length)copy(data,join(dest,'data'));
 write(join(dest,'backup.json'),{schema:'workspace.backup/v1',at:new Date().toISOString(),state:p.state,version:current?.version??null,appHash:current?.hash??null,dataHash:treeHash(data)});
 return dest;
}
function clearJournal(p){rmSync(join(p.root,'transaction.json'),{force:true})}
function commitApp(p,stage,current,receipt){
 const retired=join(p.root,'.retired-'+randomUUID());
 write(join(p.root,'transaction.json'),{schema:'workspace.transaction/v1',state:p.state,stage,retired,oldHash:current?.hash??null,newHash:receipt.hash});
 try{
  if(current)renameSync(p.app,retired);
  renameSync(stage,p.app);
 }catch(e){if(!existsSync(p.app)&&existsSync(retired))renameSync(retired,p.app);throw e}
 if(installed(p)?.hash!==receipt.hash)fail('INSTALLATION_UNCONFIRMED');
 clearJournal(p);if(existsSync(retired))rmSync(retired,{recursive:true});
}
function recover(p){
 const file=join(p.root,'transaction.json');if(!existsSync(file))return {status:'nothing_to_recover'};
 safe(file);const j=read(file);
 if(j.schema!=='workspace.transaction/v1'||j.state!==p.state||dirname(j.stage)!==p.root||dirname(j.retired)!==p.root||!j.stage.includes('/.stage-')||!j.retired.includes('/.retired-'))fail('INVALID_TRANSACTION');
 const present=installed(p);
 if(present){if(![j.oldHash,j.newHash].includes(present.hash))fail('RECOVERY_CONFLICT')}
 else if(j.oldHash&&existsSync(j.retired)){
  const files=tree(j.retired),m=JSON.parse(files[marker]);if(m.state!==p.state||m.hash!==j.oldHash||treeHash(files)!==j.oldHash)fail('RECOVERY_CONFLICT');renameSync(j.retired,p.app);
 }else if(j.oldHash)fail('RECOVERY_BACKUP_MISSING');
 clearJournal(p);
 for(const path of [j.stage,j.retired])if(existsSync(path)){safe(path);rmSync(path,{recursive:true})}
 return {status:'recovered',version:installed(p)?.version??null};
}
export function lifecycle(op,{stateDir,source=sourceRoot,backupDir}={}){
 const p=paths(stateDir);
 if(op==='doctor'){
  const m=installed(p),config=checkConfig(p);
  return {status:m?'installed':'not_installed',version:m?.version??null,app:p.app,config:p.config,installationId:config?.installationId??null,recoveryRequired:existsSync(join(p.root,'transaction.json')),sourcesConfigured:config?.sources.length??0};
 }
 if(!['install','update','backup','restore','rollback','uninstall','recover'].includes(op))fail('UNKNOWN_OPERATION');
 // All paths are explicit filesystem targets, never alternate runtime identities.
 if(!safe(p.state).isDirectory())fail('RAVI_STATE_REQUIRED');
 if(!existsSync(p.apps))mkdirSync(p.apps,{mode:0o700});safe(p.apps);privateDir(p.root);
 const lock=join(p.root,'install.lock');
 if(existsSync(lock)&&op==='recover'){
  safe(lock);const l=read(lock);if(l.host!==hostname()||!Number.isSafeInteger(l.pid)||l.pid<1)fail('LOCK_REVIEW_REQUIRED');
  try{process.kill(l.pid,0);fail('INSTALLER_RUNNING')}catch(e){if(e.code!=='ESRCH')throw e}rmSync(lock);
 }
 try{writeFileSync(lock,JSON.stringify({pid:process.pid,host:hostname()}),{flag:'wx',mode:0o600})}catch(e){if(e.code==='EEXIST')fail('INSTALLER_RUNNING');throw e}
 try{
  if(op==='recover')return recover(p);
  if(existsSync(join(p.root,'transaction.json')))fail('RECOVERY_REQUIRED');
  const current=installed(p);
  if(op==='backup'){if(!current)fail('APP_NOT_INSTALLED');checkConfig(p);return {status:'backed_up',directory:backup(p,current)}}
  if(op==='restore'){
   if(!current)fail('APP_NOT_INSTALLED');
   if(!backupDir||dirname(resolve(backupDir))!==join(p.root,'backups'))fail('INVALID_BACKUP');
   safe(backupDir);const manifest=read(join(backupDir,'backup.json')),files=tree(join(backupDir,'data'));
   if(manifest.schema!=='workspace.backup/v1'||manifest.state!==p.state||manifest.dataHash!==treeHash(files))fail('INVALID_BACKUP');
   const config=validateConfig(JSON.parse(files['config.json']));
   if(existsSync(p.config)){let present;try{present=JSON.parse(readFileSync(p.config))}catch{}if(present?.installationId&&present.installationId!==config.installationId)fail('INSTALLATION_IDENTITY_MISMATCH')}
   // Scheduling/external publication has separate native state and is never restored by copying it.
   if(existsSync(join(p.data,'operations'))||Object.keys(files).some(n=>n.startsWith('operations/')))fail('OPERATION_RESTORE_REQUIRES_REVIEW');
   const saved=backup(p,current),stage=join(p.root,'.data-'+randomUUID()),retired=join(saved,'replaced-data');copy(files,stage);
   try{if(existsSync(p.data))renameSync(p.data,retired);renameSync(stage,p.data)}catch(e){if(!existsSync(p.data)&&existsSync(retired))renameSync(retired,p.data);throw e}
   return {status:'restored',installationId:config.installationId,previousData:saved,versionUnchanged:current.version};
  }
  if(op==='uninstall'){
   if(!current)return {status:'already_uninstalled'};
   // Advanced operations are user-owned; never leave known scheduled jobs orphaned.
   if(existsSync(join(p.data,'operations')))for(const [name,bytes] of Object.entries(tree(join(p.data,'operations'))))if(name.endsWith('schedule.json')&&JSON.parse(bytes)?.status==='scheduled')fail('STOP_SCHEDULE_FIRST');
   const saved=backup(p,current);renameSync(p.app,join(saved,'removed-app'));
   return {status:'uninstalled',backup:saved,dataPreserved:p.data};
  }
  checkConfig(p);
  if(op==='rollback'){
   if(!current)fail('APP_NOT_INSTALLED');
   const last=read(join(p.root,'previous.json'));
   if(typeof last.directory!=='string'||dirname(last.directory)!==join(p.root,'backups'))fail('INVALID_BACKUP');
   const files=tree(join(last.directory,'app')),m=JSON.parse(files[marker]);
   if(m.state!==p.state||m.hash!==treeHash(files))fail('INVALID_BACKUP');
   const saved=backup(p,current),stage=join(p.root,'.stage-'+randomUUID());copy(files,stage);
   commitApp(p,stage,current,m);write(join(p.root,'previous.json'),{directory:saved});
   return {status:'rolled_back',version:m.version,configPreserved:true};
  }
  if(op==='update'&&!current)fail('APP_NOT_INSTALLED');
  const input=loadSource(source);
  if(current?.hash===input.hash)return {status:'already_installed',version:current.version,config:p.config};
  if(op==='install'&&current)fail('USE_UPDATE');
  const saved=current?backup(p,current):null;
  const stage=join(p.root,'.stage-'+randomUUID()),receipt={schema:'workspace.install/v1',state:p.state,version:input.version,hash:input.hash,at:new Date().toISOString()};
  copy(input.files,stage);write(join(stage,marker),receipt);
  // A relocated package must execute its handler and render the actual shell before switching.
  const check=Bun.spawnSync([process.execPath,join(stage,'cli.mjs'),'status','--json']);
  if(check.exitCode!==0||JSON.parse(check.stdout.toString()).version!==input.version){rmSync(stage,{recursive:true});fail('HANDLER_CHECK_FAILED')}
  privateDir(p.data);
  if(!existsSync(p.config)){
   const config=validateConfig({...structuredClone(DEFAULT_CONFIG),installationId:randomUUID(),timezone:Intl.DateTimeFormat().resolvedOptions().timeZone});
   writeFileSync(p.config,JSON.stringify(config,null,2)+'\n',{mode:0o600,flag:'wx'});
  }
  commitApp(p,stage,current,receipt);
  if(saved)write(join(p.root,'previous.json'),{directory:saved});
  return {status:current?'updated':'installed',version:input.version,app:p.app,config:p.config,backup:saved};
 }finally{rmSync(lock,{force:true})}
}
if(import.meta.main){
 try{
  const args=process.argv.slice(2).filter(x=>x!=='--'),op=args.shift();
  let stateDir=process.env.RAVI_STATE_DIR||join(homedir(),'.ravi'),backupDir;
  const seen=new Set();for(let i=0;i<args.length;i+=2){const flag=args[i],value=args[i+1];if(!value||value.startsWith('--')||seen.has(flag))fail('INVALID_ARGUMENT');seen.add(flag);if(flag==='--state-dir')stateDir=value;else if(flag==='--backup'&&op==='restore')backupDir=value;else fail('INVALID_ARGUMENT')}
  const result=lifecycle(op,{stateDir,backupDir});console.log(JSON.stringify(result));
 }catch(e){console.error(JSON.stringify({status:'failed',error:/^[A-Z_]+$/.test(e.message)?e.message:e.code==='ENOENT'?'MISSING_PATH':'INSTALLATION_FAILED'}));process.exitCode=1}
}
