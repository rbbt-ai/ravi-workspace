import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {initializeConfig} from './lib/config.mjs';
import {buildWorkspace,loadWorkspace} from './lib/build.mjs';

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
