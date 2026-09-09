import {test,expect,afterAll} from 'bun:test';
import {mkdtempSync,realpathSync,mkdirSync,readFileSync,writeFileSync,rmSync,cpSync,symlinkSync,renameSync,existsSync,statSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {lifecycle,paths} from '../scripts/workspace.mjs';
const temp=realpathSync(mkdtempSync(join(tmpdir(),'workspace-lifecycle-')));
const root=resolve(import.meta.dir,'..');
const folder=name=>{const p=join(temp,name);mkdirSync(p,{recursive:true,mode:0o700});return p};
const install=name=>{const stateDir=folder(name);lifecycle('install',{stateDir});return paths(stateDir)};
const replace=(p,value)=>writeFileSync(p,JSON.stringify(value,null,2)+'\n',{mode:0o600});
afterAll(()=>rmSync(temp,{recursive:true,force:true}));
test('install relocates real App and creates one empty private configuration',()=>{
 const p=install('first'),r=lifecycle('doctor',{stateDir:p.state});expect(r.status).toBe('installed');expect(r.sourcesConfigured).toBe(0);
 expect(statSync(p.config).mode&0o777).toBe(0o600);expect(statSync(p.data).mode&0o777).toBe(0o700);
 expect(existsSync(join(p.app,'LICENSE'))).toBe(true);
 const id=r.installationId;expect(lifecycle('install',{stateDir:p.state}).status).toBe('already_installed');expect(lifecycle('doctor',{stateDir:p.state}).installationId).toBe(id);
 const proc=Bun.spawnSync([process.execPath,join(p.app,'cli.mjs'),'status','--json']);expect(proc.exitCode).toBe(0);
});
test('two filesystem installations have independent configuration, without claiming live identities',()=>{
 const a=install('one'),b=install('two');expect(JSON.parse(readFileSync(a.config)).installationId).not.toBe(JSON.parse(readFileSync(b.config)).installationId);
 const before=readFileSync(b.config,'utf8'),c=JSON.parse(readFileSync(a.config));c.defaultTheme='dark';replace(a.config,c);expect(readFileSync(b.config,'utf8')).toBe(before);
});
test('update and rollback preserve config, cached data and installation ID',()=>{
 const old=folder('older-source');cpSync(root,old,{recursive:true});
 for(const rel of ['package.json','src/apps/workspace-hub/ravi.app.json']){const f=join(old,rel),v=JSON.parse(readFileSync(f));v.version='0.1.0-alpha.5';replace(f,v)}
 const stateDir=folder('updating');lifecycle('install',{stateDir,source:old});const p=paths(stateDir);
 const c=JSON.parse(readFileSync(p.config));c.defaultTheme='dark';c.widgets=[{id:'meetings',size:'wide'}];replace(p.config,c);
 const before=readFileSync(p.config,'utf8');writeFileSync(join(p.data,'local-note.txt'),'local only',{mode:0o600});
 expect(lifecycle('update',{stateDir}).status).toBe('updated');expect(readFileSync(p.config,'utf8')).toBe(before);
 expect(lifecycle('rollback',{stateDir}).version).toBe('0.1.0-alpha.5');expect(readFileSync(p.config,'utf8')).toBe(before);expect(readFileSync(join(p.data,'local-note.txt'),'utf8')).toBe('local only');
 expect(lifecycle('update',{stateDir}).version).toBe('0.1.0-alpha.7');
});
test('unknown config schema blocks update without losing the installed App',()=>{
 const p=install('schema');const c=JSON.parse(readFileSync(p.config));c.schema='workspace.config/v99';replace(p.config,c);
 expect(()=>lifecycle('update',{stateDir:p.state})).toThrow();expect(existsSync(join(p.app,'cli.mjs'))).toBe(true);expect(JSON.parse(readFileSync(p.config)).schema).toBe('workspace.config/v99');
});
test('unmanaged App or modified managed code is never overwritten',()=>{
 const stateDir=folder('unmanaged'),p=paths(stateDir);mkdirSync(p.app,{recursive:true});writeFileSync(join(p.app,'keep.txt'),'keep');
 expect(()=>lifecycle('install',{stateDir})).toThrow('UNMANAGED_APP');expect(readFileSync(join(p.app,'keep.txt'),'utf8')).toBe('keep');
 const m=install('modified');writeFileSync(join(m.app,'cli.mjs'),'modified');expect(()=>lifecycle('update',{stateDir:m.state})).toThrow('INSTALLATION_MODIFIED');
});
test('symlinks and live install lock are refused',()=>{
 const p=install('links'),target=join(temp,'state-link');symlinkSync(p.state,target);expect(()=>lifecycle('update',{stateDir:target})).toThrow('UNSAFE_PATH');
 writeFileSync(join(p.root,'install.lock'),'held',{mode:0o600});expect(()=>lifecycle('update',{stateDir:p.state})).toThrow('INSTALLER_RUNNING');rmSync(join(p.root,'install.lock'));
 symlinkSync(p.config,join(p.data,'alias'));expect(()=>lifecycle('backup',{stateDir:p.state})).toThrow('UNSAFE_PATH');
});
test('backup and uninstall affect only owned code, preserving data and neighboring App',()=>{
 const p=install('removal'),sibling=join(p.apps,'neighbor');mkdirSync(sibling);writeFileSync(join(sibling,'keep'),'neighbor');
 const before=readFileSync(p.config,'utf8'),b=lifecycle('backup',{stateDir:p.state});expect(readFileSync(join(b.directory,'data/config.json'),'utf8')).toBe(before);
 expect(lifecycle('uninstall',{stateDir:p.state}).status).toBe('uninstalled');expect(readFileSync(p.config,'utf8')).toBe(before);expect(readFileSync(join(sibling,'keep'),'utf8')).toBe('neighbor');
 expect(lifecycle('uninstall',{stateDir:p.state}).status).toBe('already_uninstalled');
 lifecycle('install',{stateDir:p.state});expect(readFileSync(p.config,'utf8')).toBe(before);
});
test('uninstall refuses a known scheduled operation until stopped',()=>{
 const p=install('scheduled'),dir=join(p.data,'operations','fixture-installation');mkdirSync(dir,{recursive:true,mode:0o700});replace(join(dir,'schedule.json'),{status:'scheduled',id:'fixture-job'});
 expect(()=>lifecycle('uninstall',{stateDir:p.state})).toThrow('STOP_SCHEDULE_FIRST');expect(existsSync(p.app)).toBe(true);
});
test('explicit restore validates backup integrity and preserves displaced data',()=>{
 const p=install('restore'),before=readFileSync(p.config,'utf8'),b=lifecycle('backup',{stateDir:p.state});
 const c=JSON.parse(before);c.defaultTheme='dark';replace(p.config,c);
 const r=lifecycle('restore',{stateDir:p.state,backupDir:b.directory});expect(r.status).toBe('restored');expect(readFileSync(p.config,'utf8')).toBe(before);expect(JSON.parse(readFileSync(join(r.previousData,'data/config.json'))).defaultTheme).toBe('dark');
 replace(join(b.directory,'data/config.json'),{...JSON.parse(before),defaultTheme:'dark'});expect(()=>lifecycle('restore',{stateDir:p.state,backupDir:b.directory})).toThrow('INVALID_BACKUP');
 expect(()=>lifecycle('restore',{stateDir:p.state,backupDir:temp})).toThrow('INVALID_BACKUP');
});
test('recovery restores old code after an interrupted rename, preserving config',()=>{
 const p=install('recovery'),m=JSON.parse(readFileSync(join(p.app,'.workspace-install.json'))),retired=join(p.root,'.retired-fixture'),stage=join(p.root,'.stage-fixture');
 cpSync(p.app,stage,{recursive:true});renameSync(p.app,retired);
 replace(join(p.root,'transaction.json'),{schema:'workspace.transaction/v1',state:p.state,retired,stage,oldHash:m.hash,newHash:'f'.repeat(64)});
 expect(()=>lifecycle('update',{stateDir:p.state})).toThrow('RECOVERY_REQUIRED');expect(lifecycle('recover',{stateDir:p.state}).status).toBe('recovered');expect(lifecycle('doctor',{stateDir:p.state}).status).toBe('installed');
});
test('relocated open serves real Home and five destinations without fictional records',async()=>{
 const p=install('http');const child=Bun.spawn([process.execPath,join(p.app,'cli.mjs'),'open','--port','0'],{stdout:'pipe',stderr:'pipe'});
 try{
  const reader=child.stdout.getReader(),first=await reader.read();const result=JSON.parse(new TextDecoder().decode(first.value));reader.releaseLock();
  const response=await fetch(result.url),html=await response.text();expect(response.status).toBe(200);
  for(const label of ['Home','Trabalho','Agentes','Alerts','Connectors'])expect(html).toContain(label);
  expect(html).toContain('workspaceSetupNonce');expect(html).not.toContain('astra-lab');expect(html).not.toContain('thiago');
 }finally{child.kill();await child.exited}
});
