import {readFile,mkdir,writeFile,rename,unlink,stat} from 'node:fs/promises';
import {dirname,resolve,join} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {validateConfig,browserConfig,readConfig} from './config.mjs';
import {contextMap} from './context-engine.mjs';
import {validateProjects} from './context-engine.mjs';
import {projectSnapshot} from './snapshot.mjs';
const ui=new URL('../ui/workspace/',import.meta.url);
const read=name=>readFile(new URL(name,ui),'utf8');
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json=v=>JSON.stringify(v).replace(/[<>&\u2028\u2029]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0'));
async function asset(file,base,kind){
 const path=resolve(base,file),info=await stat(path);if(!info.isFile()||info.size>2500000)throw Error('INVALID_BRAND_ASSET');
 const b=await readFile(path);let mime;
 if(kind==='font'){if(b.subarray(0,4).toString()==='wOF2')mime='font/woff2';else if(b.subarray(0,4).toString()==='OTTO')mime='font/otf';}
 if(kind==='logo'){if(b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))mime='image/png';else if(b[0]===255&&b[1]===216&&b[2]===255)mime='image/jpeg';else if(b.subarray(0,4).toString()==='RIFF'&&b.subarray(8,12).toString()==='WEBP')mime='image/webp';}
 if(!mime)throw Error('UNSUPPORTED_BRAND_ASSET');return `data:${mime};base64,${b.toString('base64')}`;
}
export async function renderWorkspace(rawConfig,rawSnapshot=null,assetBase=process.cwd(),map=null){
 const config=validateConfig(rawConfig),data=projectSnapshot(rawSnapshot,config),safe=browserConfig(config);
 if(map){validateProjects(map.projects,new Set(map.sources.map(s=>s.id)));data.contextMap=map;}
 const logo=config.brand.logoFile?await asset(config.brand.logoFile,assetBase,'logo'):'data:image/svg+xml;base64,'+Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="12" y="12" width="76" height="76" rx="24" fill="#846fff"/><path d="M32 67V33h18c17 0 20 23 3 25l16 9H55L42 56v11zm10-21h9c6 0 6-4 0-4h-9z" fill="white"/></svg>').toString('base64');
 let css=(await Promise.all(['themes.css','style.css','home.css','alerts.css','connectors.css','project-context.css','activity.css','refinement.css','context-map.css'].map(read))).join('\n');
 for(const [token,file]of [['__FONT_SANS__','montserrat-latin.woff2'],['__FONT_MONO__','geist-mono-latin.woff2']])css=css.replaceAll(token,(await readFile(new URL('fonts/'+file,ui))).toString('base64'));
 for(const [field,weight]of [['displayFontRegular',400],['displayFontBold',800]])if(config.brand[field])css+=`\n@font-face{font-family:'Workspace Display';src:url('${await asset(config.brand[field],assetBase,'font')}');font-weight:${weight};font-display:swap}`;
 if(config.brand.displayFontRegular)css+="\n:root{--font-display:'Workspace Display','Montserrat',sans-serif}";
 for(const mode of ['day','dark'])css+=`\n:root[data-theme="${mode}"]{${Object.entries(config.theme[mode]).map(([k,v])=>`--${k}:${v}`).join(';')}}`;
 css+='\n.brand-wordmark{max-width:135px;overflow-wrap:anywhere}.side-context>span:last-child{min-width:0;overflow-wrap:anywhere}.identity>span:last-child{min-width:0;overflow-wrap:anywhere}';
 if(!config.brand.logoFile)css+='\n:root .brand-symbol{filter:none}';
 if(config.brand.wordmark.length>5)css+='\n.brand-wordmark{font-size:20px;letter-spacing:-.03em}.mobile-wordmark{font-size:15px}';
 const modules=['alerts-model.js','alerts.js','home.js','project-context.js','feeds.js','feeds-snapshot.js','connectors.js','activity-ui.js','views.js'];
 const app=(await read('vendor/motion.js'))+'\n'+(await read('app.js')).replace('/*__VIEWS__*/',(await Promise.all(modules.map(read))).join('\n'));
 const replacements={TITLE:escape(safe.title),LOGO_URI:logo,CONFIG:json(safe),THEME:await read('theme.js'),STYLE:css,WORDMARK:escape(config.brand.wordmark),WORKSPACE_NAME:escape(config.workspaceName),INITIALS:escape((config.owner.name||config.brand.wordmark).split(/\s+/).map(s=>s[0]).slice(0,2).join('')),OWNER_NAME:escape(config.owner.name||'Sua instalação'),OWNER_CONTEXT:escape(config.owner.context||config.workspaceName),DATA:json(data),APP:app};
 let html=(await read('template.html')).replace('lang="pt-BR"',`lang="${escape(config.locale)}"`).replace(/\/\*__(\w+)__\*\//g,(_,k)=>{if(!(k in replacements))throw Error('UNKNOWN_TEMPLATE_TOKEN');return replacements[k];});
 if(/\/\*__\w+__\*\//.test(html))throw Error('INCOMPLETE_TEMPLATE');
 return {html,data,installationId:config.installationId,sha256:createHash('sha256').update(html).digest('hex')};
}
export async function loadWorkspace(configFile,snapshotFile){
 const config=await readConfig(configFile);let snapshot=null;
 if(snapshotFile){const info=await stat(snapshotFile);if(info.size>10000000)throw Error('SNAPSHOT_TOO_LARGE');snapshot=JSON.parse(await readFile(snapshotFile,'utf8'));}
 return renderWorkspace(config,snapshot,dirname(resolve(configFile)),await contextMap(configFile));
}
export async function buildWorkspace(configFile,snapshotFile,out){
 const result=await loadWorkspace(configFile,snapshotFile),dir=resolve(out),target=join(dir,'index.html');
 // The ownership marker lives in the same atomic HTML artifact: no split manifest/index transaction.
 const marker=`<!-- workspace-installation:${result.installationId} -->`;
 await mkdir(dir,{recursive:true,mode:0o700});const temp=join(dir,'.index-'+randomUUID()+'.tmp'),lock=join(dir,'.workspace-build.lock');
 try{await writeFile(lock,result.installationId,{mode:0o600,flag:'wx'});}catch(e){if(e.code==='EEXIST')throw Error('BUILD_ALREADY_RUNNING');throw e;}
 try{
  try{const previous=await readFile(target,'utf8');if(!previous.startsWith(marker+'\n'))throw Error('OUTPUT_OWNERSHIP_MISMATCH');}catch(e){if(e.code!=='ENOENT')throw e;}
  await writeFile(temp,marker+'\n'+result.html,{mode:0o600,flag:'wx'});await rename(temp,target);
 }finally{await unlink(temp).catch(e=>{if(e.code!=='ENOENT')throw e;});await unlink(lock);}
 return {status:'built',installationId:result.installationId,sha256:result.sha256,configuredSources:Object.entries(result.data.sourceStates).filter(([,s])=>s.status==='ready').map(([n])=>n)};
}
