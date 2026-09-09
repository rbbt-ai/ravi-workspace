import {readFile} from 'node:fs/promises';
import {randomBytes,timingSafeEqual} from 'node:crypto';
import {readConfig} from './config.mjs';
import {renderWorkspace} from './build.mjs';
import {discover} from './native.mjs';
import {dirname,resolve} from 'node:path';
import {readSnapshot,setupView,saveSetup,collect,importSnapshot} from './setup.mjs';
export async function startSetup(configFile,{port=0,inventoryLoader=discover,collectOptions={}}={}){
 await readConfig(configFile);const nonce=randomBytes(32).toString('hex');let inventory=null,busy=false;
 const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY'};
 const json=(body,status=200)=>Response.json(body,{status,headers});
 const server=Bun.serve({hostname:'127.0.0.1',port,maxRequestBodySize:1000000,async fetch(request){
  const url=new URL(request.url),expected=`http://127.0.0.1:${server.port}`;
  if(url.origin!==expected||request.headers.get('host')!==new URL(expected).host)return json({error:'HOST_REJECTED'},403);
  try{
   if(request.method==='GET'&&url.pathname==='/'){
    const config=await readConfig(configFile),snapshot=await readSnapshot(configFile),rendered=await renderWorkspace(config,snapshot,dirname(resolve(configFile)));
    const ui=new URL('../ui/workspace/',import.meta.url),css=await readFile(new URL('setup.css',ui),'utf8'),script=await readFile(new URL('setup.js',ui),'utf8');
    const bootstrap={installationId:config.installationId,firstRun:config.sources.length===0,needsCollection:config.sources.length>0&&!snapshot};
    const html=rendered.html.replace("connect-src 'none'","connect-src 'self'").replace('</head>',`<style>${css}</style></head>`).replace('</body>',`<script>window.workspaceSetupNonce=${JSON.stringify(nonce)};window.workspaceSetupBootstrap=${JSON.stringify(bootstrap).replace(/</g,'\\u003c')};</script><script>${script}</script></body>`);
    return new Response(html,{headers:{...headers,'Content-Type':'text/html; charset=utf-8'}});
   }
   if(request.method!=='POST')return json({error:'NOT_FOUND'},404);
   const supplied=request.headers.get('x-workspace-setup')||'';
   if(request.headers.get('origin')!==expected||request.headers.get('content-type')!=='application/json'||supplied.length!==nonce.length||!timingSafeEqual(Buffer.from(supplied),Buffer.from(nonce)))return json({error:'REQUEST_REJECTED'},403);
   if(!['/setup/discover','/setup/save','/setup/collect','/setup/import'].includes(url.pathname))return json({error:'NOT_FOUND'},404);
   if(busy)return json({error:'SETUP_BUSY'},409);busy=true;
   try{
    const payload=await request.json();
    if(url.pathname==='/setup/discover'){
     const config=await readConfig(configFile);
     if(!inventory||inventory.historyDays!==config.historyDays||Date.now()-Date.parse(inventory.capturedAt)>60000)inventory=await inventoryLoader(config.historyDays);
     return json(setupView(config,inventory,await readSnapshot(configFile)));
    }
    if(url.pathname==='/setup/save')return json(await saveSetup(configFile,payload,inventory));
    if(url.pathname==='/setup/collect'){
     const result=await collect(configFile,{inventoryLoader,...collectOptions});inventory=result.inventory;
     const {inventory:ignored,...safe}=result;return json(safe);
    }
    return json(await importSnapshot(configFile,payload));
   }finally{busy=false;}
  }catch(e){const code=/^[A-Z_]+$/.test(e.message)?e.message:'INVALID_INPUT';return json({error:code},code==='CONFIG_CHANGED'||code==='SETUP_BUSY'?409:422);}
 }});
 return server;
}
