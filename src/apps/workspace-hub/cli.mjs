import {contextView,collectContext,packet,applyContext,requestAnalysis} from './lib/context-engine.mjs';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {initializeConfig} from './lib/config.mjs';
import {buildWorkspace,loadWorkspace} from './lib/build.mjs';
import {readConfig} from './lib/config.mjs';
import {discover,sdkDiagnostics} from './lib/native.mjs';
import {collect,readSnapshot,setupView} from './lib/setup.mjs';
import {startSetup} from './lib/setup-server.mjs';
import {prepareOperation,operationStatus,refreshOperation,scheduleOperation} from './lib/operations.mjs';
import {join} from 'node:path';

const root=new URL('./',import.meta.url);
export async function packageStatus(){
  const manifest=JSON.parse(await readFile(new URL('ravi.app.json',root),'utf8'));
  const ui=await readFile(new URL('ui/index.html',root),'utf8');
  return {
    schema:'workspace.installation/v1',
    appId:manifest.id,
    name:manifest.name,
    version:manifest.version,
    inspectedAt:new Date().toISOString(),
    installation:{manifestAvailable:true,frontendAvailable:ui.includes('id="installation"'),frontendSha256:createHash('sha256').update(ui).digest('hex')},
    setup:{status:'required',configuredSources:0,reason:'Nenhuma fonte foi configurada nesta instalação.'},
    scope:'package-diagnostics'
  };
}

if(import.meta.main){
  const args=process.argv.slice(2),op=args.shift();
  try{
    if(op==='status'&&args.every(a=>a==='--json'))console.log(JSON.stringify(await packageStatus()));
    else if(op==='sdk-status'&&args.every(a=>a==='--json'))console.log(JSON.stringify(await sdkDiagnostics()));
    else if(['context-status','context-collect','context-packet','context-apply','context-analyze'].includes(op)){
      const options={};for(let i=0;i<args.length;i++){if(args[i]==='--json')continue;if(!['--config','--patch'].includes(args[i])||!args[i+1]||options[args[i]])throw Error('INVALID_ARGUMENT');options[args[i]]=args[++i];}
      if(!options['--config'])throw Error('CONFIG_REQUIRED');
      const file=options['--config'];
      const result=op==='context-status'?await contextView(file):op==='context-collect'?await collectContext(file):op==='context-packet'?await packet(file):op==='context-analyze'?await requestAnalysis(file):await applyContext(file,JSON.parse(await readFile(options['--patch'],'utf8')));
      console.log(JSON.stringify(result));
    }
    else if(['prepare-operation','operation-status','refresh','schedule'].includes(op)){
      const allowed=op==='prepare-operation'?['--config','--root','--project','--interval']:['--operation',...(op==='refresh'?['--publish']:op==='schedule'?['--apply']:[])];
      const options={};for(let i=0;i<args.length;i++){const flag=args[i];if(flag==='--json')continue;if(!allowed.includes(flag)||options[flag]!==undefined)throw Error('INVALID_ARGUMENT');if(['--publish','--apply'].includes(flag))options[flag]=true;else{if(!args[i+1]||args[i+1].startsWith('--'))throw Error('INVALID_ARGUMENT');options[flag]=args[++i];}}
      let result;
      if(op==='prepare-operation'){if(!options['--config']||!options['--root']||!options['--project'])throw Error('OPERATION_ARGUMENTS_REQUIRED');result=await prepareOperation(options['--config'],options['--root'],options['--project'],{intervalMinutes:Number(options['--interval']||15)});}
      else{if(!options['--operation'])throw Error('OPERATION_REQUIRED');result=op==='operation-status'?await operationStatus(options['--operation']):op==='refresh'?await refreshOperation(options['--operation'],{publish:Boolean(options['--publish'])}):await scheduleOperation(options['--operation'],{apply:Boolean(options['--apply'])});}
      console.log(JSON.stringify(result));
    }
    else if(['discover','collect','setup','open'].includes(op)){
      const options={};for(let i=0;i<args.length;i++){if(args[i]==='--json')continue;if(!['--config','--port'].includes(args[i])||!args[i+1]||options[args[i]])throw Error('INVALID_ARGUMENT');options[args[i]]=args[++i];}
      if(op==='open'&&!options['--config']){const m=JSON.parse(await readFile(new URL('.workspace-install.json',root),'utf8'));if(m.schema!=='workspace.install/v1'||typeof m.state!=='string')throw Error('INSTALLATION_REQUIRED');options['--config']=join(m.state,'workspace-hub-installation/data/config.json');}
      if(!options['--config'])throw Error('CONFIG_REQUIRED');if(options['--port']&&!['setup','open'].includes(op))throw Error('INVALID_ARGUMENT');
      if(['setup','open'].includes(op)){const port=Number(options['--port']??(op==='open'?4318:0));if(!Number.isInteger(port)||port<0||port>65535)throw Error('INVALID_PORT');const server=await startSetup(options['--config'],{port});console.log(JSON.stringify({status:'listening',url:`http://127.0.0.1:${server.port}/${op==='setup'?'#/setup':''}`,scope:'local-installation-setup'}));const close=()=>{server.stop(true);process.exit(0)};process.on('SIGINT',close);process.on('SIGTERM',close);}
      else if(op==='discover'){const c=await readConfig(options['--config']);console.log(JSON.stringify(setupView(c,await discover(c.historyDays),await readSnapshot(options['--config']))));}
      else{const {inventory,...result}=await collect(options['--config']);console.log(JSON.stringify(result));}
    }
    else if(['init','build'].includes(op)){
      const options={};for(let i=0;i<args.length;i++){if(args[i]==='--json')continue;if(!['--config','--snapshot','--out'].includes(args[i])||!args[i+1]||args[i+1].startsWith('--')||options[args[i]])throw Error('INVALID_ARGUMENT');options[args[i]]=args[++i];}
      if(!options['--config'])throw Error('CONFIG_REQUIRED');
      if(op==='init'){if(Object.keys(options).length!==1)throw Error('INVALID_ARGUMENT');console.log(JSON.stringify(await initializeConfig(options['--config'])));}
      else{if(!options['--out'])throw Error('OUTPUT_REQUIRED');console.log(JSON.stringify(await buildWorkspace(options['--config'],options['--snapshot'],options['--out'])));}
    }
    else if(op==='preview'){
      let port=0,workspace=false,configFile,snapshotFile;
      for(let i=0;i<args.length;i++){
        if(args[i]==='--json')continue;
        if(args[i]==='--workspace')workspace=true;
        else if(['--config','--snapshot'].includes(args[i])&&args[i+1]&&!args[i+1].startsWith('--')){const flag=args[i],value=args[++i];if(flag==='--config')configFile=value;else snapshotFile=value;}
        else if(args[i]==='--port'&&/^\d+$/.test(args[i+1]??'')){port=Number(args[++i]);if(port>65535)throw Error('INVALID_PORT');}
        else throw Error('INVALID_ARGUMENT');
      }
      if(workspace&&!configFile)throw Error('CONFIG_REQUIRED');if(!workspace&&(configFile||snapshotFile))throw Error('WORKSPACE_FLAG_REQUIRED');
      const html=workspace?(await loadWorkspace(configFile,snapshotFile)).html:await readFile(new URL('ui/index.html',root),'utf8');
      const server=Bun.serve({hostname:'127.0.0.1',port,async fetch(request){
        const url=new URL(request.url);
        if(!['127.0.0.1','localhost'].includes(url.hostname))return new Response('Forbidden',{status:403});
        const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
        if(request.method!=='GET')return new Response('Method not allowed',{status:405,headers});
        if(url.pathname==='/')return new Response(html,{headers:{...headers,'Content-Type':'text/html; charset=utf-8'}});
        if(url.pathname==='/installation.json')return Response.json(await packageStatus(),{headers});
        return new Response('Not found',{status:404,headers});
      }});
      console.log(JSON.stringify({status:'listening',url:`http://127.0.0.1:${server.port}`,scope:workspace?'installation-preview':'package-diagnostics',privateSourcesLoaded:workspace&&Boolean(snapshotFile)}));
      const close=()=>{server.stop(true);process.exit(0);};process.on('SIGINT',close);process.on('SIGTERM',close);
    }else throw Error('UNKNOWN_OPERATION');
  }catch(error){const code=error.code==='ENOENT'?'PACKAGE_INCOMPLETE':error.code==='EEXIST'?'ALREADY_EXISTS':/^[A-Z][A-Z0-9_]+$/.test(error.message)?error.message:'INVALID_INPUT';console.error(JSON.stringify({error:code}));process.exitCode=1;}
}
